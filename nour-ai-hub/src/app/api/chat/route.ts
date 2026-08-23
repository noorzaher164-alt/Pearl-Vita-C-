import { NextRequest, NextResponse } from 'next/server';
import { routeRequest } from '@/core/router';
import { getAgentsByCategories } from '@/core/agent-registry';
import { getMemory } from '@/core/memory';
import { GLOBAL_RULES } from '@/prompts/global-rules';
import type { AgentResponse, ChatMessage, RoutingResult } from '@/core/types';

async function callLLM(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  const provider = process.env.LLM_PROVIDER || 'openai';

  if (!apiKey) {
    return simulateResponse(systemPrompt, messages);
  }

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || 'No response generated.';
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

function simulateResponse(systemPrompt: string, messages: { role: string; content: string }[]): string {
  const lastMessage = messages[messages.length - 1]?.content || '';
  const agentMatch = systemPrompt.match(/You are the (.+?) Agent/);
  const agentName = agentMatch?.[1] || 'Assistant';

  return `[${agentName} Agent Response]\n\nI've analyzed your request: "${lastMessage.substring(0, 100)}${lastMessage.length > 100 ? '...' : ''}"\n\nThis is a simulated response because no API key is configured. To get real AI responses, set OPENAI_API_KEY or ANTHROPIC_API_KEY in your .env.local file.\n\nBased on my specialization as the ${agentName} Agent, I would provide detailed assistance with this request.`;
}

async function executeAgent(
  agentId: string,
  systemPrompt: string,
  task: string,
  conversationHistory: { role: string; content: string }[]
): Promise<AgentResponse> {
  const messages = [
    ...conversationHistory.slice(-6),
    { role: 'user', content: task },
  ];

  const content = await callLLM(systemPrompt + '\n\n' + GLOBAL_RULES, messages);

  return {
    agent: agentId as AgentResponse['agent'],
    content,
    subtask: task,
  };
}

async function orchestrate(
  message: string,
  routing: RoutingResult,
  conversationHistory: { role: string; content: string }[]
): Promise<{ finalResponse: string; agentResponses: AgentResponse[] }> {
  const agents = getAgentsByCategories(routing.agents);

  if (agents.length === 1) {
    const agent = agents[0];
    const response = await executeAgent(
      agent.id,
      agent.systemPrompt,
      message,
      conversationHistory
    );
    return { finalResponse: response.content, agentResponses: [response] };
  }

  const subtasks = routing.subtasks || agents.map(a => ({
    agent: a.id,
    task: message,
  }));

  const agentResponses = await Promise.all(
    subtasks.map(subtask => {
      const agent = agents.find(a => a.id === subtask.agent) || agents[0];
      return executeAgent(agent.id, agent.systemPrompt, subtask.task, conversationHistory);
    })
  );

  const combinedContext = agentResponses
    .map(r => `### ${r.agent} Agent Output:\n${r.content}`)
    .join('\n\n---\n\n');

  const masterPrompt = `You are the Master Agent of Nour AI Hub. You received outputs from multiple specialized agents. Your job is to combine these into ONE coherent, well-structured response for the user.

Do NOT mention internal agent names or routing. Present the information as if it comes from one unified assistant.

Match the user's language: if they wrote in Arabic, respond in Arabic. If English, respond in English. If mixed, use mixed.

Here are the agent outputs to combine:

${combinedContext}

Create a single, well-organized response that integrates all the information naturally.`;

  const finalResponse = await callLLM(masterPrompt, [
    { role: 'user', content: message },
  ]);

  return { finalResponse, agentResponses };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body as {
      message: string;
      conversationHistory: ChatMessage[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const history = conversationHistory.map((m: ChatMessage) => ({
      role: m.role,
      content: m.content,
    }));

    const memory = getMemory();
    const memoryContext = Object.entries(memory.user_preferences).length > 0
      ? `User preferences: ${JSON.stringify(memory.user_preferences)}`
      : '';

    const routing = routeRequest(message, memoryContext);
    const { finalResponse, agentResponses } = await orchestrate(message, routing, history);

    return NextResponse.json({
      response: finalResponse,
      debug: {
        routing,
        agentResponses: agentResponses.map(r => ({
          agent: r.agent,
          subtask: r.subtask,
          contentPreview: r.content.substring(0, 200) + '...',
        })),
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
