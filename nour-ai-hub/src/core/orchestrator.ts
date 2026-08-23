import {
  AgentCategory,
  AgentResponse,
  ChatMessage,
  OrchestratorResult,
  RoutingResult,
  Subtask,
  MemoryStore,
} from './types';
import { getAgent, getAgentsByCategories } from './agent-registry';
import { GLOBAL_RULES } from '../prompts/global-rules';
import { LLM_CONFIG, APP_SETTINGS } from '../config/settings';

// ---------------------------------------------------------------------------
// Internal LLM call -- posts to the app's own /api/llm endpoint
// ---------------------------------------------------------------------------

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callLLM(messages: LLMMessage[]): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/llm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: LLM_CONFIG.model,
      temperature: LLM_CONFIG.temperature,
      maxTokens: LLM_CONFIG.maxTokens,
    }),
    signal: AbortSignal.timeout(APP_SETTINGS.apiTimeout),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.content || data.message || '';
}

// ---------------------------------------------------------------------------
// Build the system prompt for a specific agent
// ---------------------------------------------------------------------------

function buildAgentSystemPrompt(
  agentCategory: AgentCategory,
  memory: MemoryStore,
): string {
  const agent = getAgent(agentCategory);
  if (!agent) {
    return `${GLOBAL_RULES}\n\nYou are a helpful assistant.`;
  }

  const memoryContext = buildMemoryContext(memory);

  return [
    GLOBAL_RULES,
    '',
    `## Agent: ${agent.name}`,
    agent.systemPrompt,
    '',
    memoryContext ? `## Remembered Context\n${memoryContext}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Serialize relevant memory into a prompt-friendly string
// ---------------------------------------------------------------------------

function buildMemoryContext(memory: MemoryStore): string {
  const parts: string[] = [];

  const prefs = Object.entries(memory.user_preferences);
  if (prefs.length > 0) {
    parts.push('User preferences: ' + prefs.map(([k, v]) => `${k}: ${v}`).join('; '));
  }

  const brands = Object.entries(memory.brands);
  if (brands.length > 0) {
    for (const [key, brand] of brands) {
      const details = [`name: ${brand.name}`];
      if (brand.tone) details.push(`tone: ${brand.tone}`);
      if (brand.colors?.length) details.push(`colors: ${brand.colors.join(', ')}`);
      if (brand.fonts?.length) details.push(`fonts: ${brand.fonts.join(', ')}`);
      parts.push(`Brand "${key}": ${details.join('; ')}`);
    }
  }

  const projects = Object.entries(memory.projects);
  if (projects.length > 0) {
    for (const [key, proj] of projects) {
      const details = [`name: ${proj.name}`];
      if (proj.status) details.push(`status: ${proj.status}`);
      if (proj.goal) details.push(`goal: ${proj.goal}`);
      parts.push(`Project "${key}": ${details.join('; ')}`);
    }
  }

  const teaching = Object.entries(memory.teaching);
  if (teaching.length > 0) {
    parts.push('Teaching context: ' + teaching.map(([k, v]) => `${k}: ${v}`).join('; '));
  }

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Single-agent execution
// ---------------------------------------------------------------------------

async function executeSingleAgent(
  message: string,
  agentCategory: AgentCategory,
  memory: MemoryStore,
  conversationHistory: ChatMessage[],
): Promise<AgentResponse> {
  const systemPrompt = buildAgentSystemPrompt(agentCategory, memory);

  // Build message history for the LLM
  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Include recent conversation history for continuity (last N turns)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // Add the current message
  messages.push({ role: 'user', content: message });

  const content = await callLLM(messages);

  return {
    agent: agentCategory,
    content,
  };
}

// ---------------------------------------------------------------------------
// Multi-agent execution: runs subtasks respecting dependency order
// ---------------------------------------------------------------------------

async function executeMultiAgent(
  message: string,
  subtasks: Subtask[],
  memory: MemoryStore,
  conversationHistory: ChatMessage[],
): Promise<AgentResponse[]> {
  const responses: AgentResponse[] = [];
  const completedAgents = new Set<AgentCategory>();

  // Group subtasks into dependency layers for parallel execution
  const remaining = [...subtasks];

  while (remaining.length > 0) {
    // Find tasks whose dependencies are all satisfied
    const ready = remaining.filter(
      (task) =>
        !task.dependsOn ||
        task.dependsOn.length === 0 ||
        task.dependsOn.every((dep) => completedAgents.has(dep)),
    );

    if (ready.length === 0) {
      // Circular dependency or missing dependency -- execute all remaining
      ready.push(...remaining);
    }

    // Remove ready tasks from remaining
    for (const task of ready) {
      const idx = remaining.indexOf(task);
      if (idx !== -1) remaining.splice(idx, 1);
    }

    // Build context from previously completed agent outputs
    const priorOutputs = responses
      .map((r) => `[${r.agent} output]:\n${r.content}`)
      .join('\n\n');

    // Execute ready tasks in parallel
    const results = await Promise.allSettled(
      ready.map(async (task) => {
        const taskMessage = priorOutputs
          ? `Original request: ${message}\n\nYour specific task: ${task.task}\n\nOutputs from other agents so far:\n${priorOutputs}`
          : `Original request: ${message}\n\nYour specific task: ${task.task}`;

        const response = await executeSingleAgent(
          taskMessage,
          task.agent,
          memory,
          conversationHistory,
        );
        return { ...response, subtask: task.task };
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        responses.push(result.value);
        completedAgents.add(result.value.agent);
      } else {
        // On failure, record an error response so the synthesis step knows
        const failedTask = ready[results.indexOf(result)];
        responses.push({
          agent: failedTask.agent,
          content: `[Agent error: ${failedTask.agent} could not complete its task.]`,
          subtask: failedTask.task,
        });
        completedAgents.add(failedTask.agent);
      }
    }
  }

  return responses;
}

// ---------------------------------------------------------------------------
// Synthesis -- combines multiple agent responses into one coherent output
// ---------------------------------------------------------------------------

async function synthesizeResponses(
  message: string,
  agentResponses: AgentResponse[],
  memory: MemoryStore,
): Promise<string> {
  if (agentResponses.length === 1) {
    return agentResponses[0].content;
  }

  const responseSummary = agentResponses
    .map((r) => `### ${r.agent}${r.subtask ? ` (Task: ${r.subtask})` : ''}\n${r.content}`)
    .join('\n\n---\n\n');

  const synthesisPrompt = `You are the Nour AI Hub orchestrator. Multiple specialist agents have produced outputs for the user's request. Your job is to combine them into ONE coherent, well-structured response.

${GLOBAL_RULES}

## Instructions
- Merge the outputs into a single, flowing response that reads naturally.
- Use clear section headings when the response covers multiple topics.
- Remove redundant information -- do not repeat what multiple agents said.
- Resolve any contradictions by favoring the more specialized agent.
- Maintain the tone and language (Arabic/English/mixed) that the user used.
- Do NOT mention that multiple agents were involved or expose internal routing.
- The final response should feel like it came from one knowledgeable assistant.`;

  const messages: LLMMessage[] = [
    { role: 'system', content: synthesisPrompt },
    {
      role: 'user',
      content: `User's original request:\n${message}\n\n---\n\nAgent outputs to combine:\n\n${responseSummary}`,
    },
  ];

  return callLLM(messages);
}

// ---------------------------------------------------------------------------
// Main orchestration function
// ---------------------------------------------------------------------------

export async function orchestrate(
  message: string,
  routingResult: RoutingResult,
  memory: MemoryStore,
  conversationHistory: ChatMessage[],
): Promise<OrchestratorResult> {
  let agentResponses: AgentResponse[];

  if (!routingResult.isMultiAgent || routingResult.agents.length === 1) {
    // Single-agent path
    const response = await executeSingleAgent(
      message,
      routingResult.agents[0],
      memory,
      conversationHistory,
    );
    agentResponses = [response];
  } else if (routingResult.subtasks && routingResult.subtasks.length > 0) {
    // Multi-agent with subtasks
    agentResponses = await executeMultiAgent(
      message,
      routingResult.subtasks,
      memory,
      conversationHistory,
    );
  } else {
    // Multi-agent without subtasks -- run all agents in parallel on the full message
    const results = await Promise.allSettled(
      routingResult.agents.map((agent) =>
        executeSingleAgent(message, agent, memory, conversationHistory),
      ),
    );
    agentResponses = results
      .filter((r): r is PromiseFulfilledResult<AgentResponse> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  // Synthesize into a single response
  const finalResponse = await synthesizeResponses(message, agentResponses, memory);

  return {
    finalResponse,
    routing: routingResult,
    agentResponses,
  };
}
