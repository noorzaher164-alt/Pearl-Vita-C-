export type AgentCategory =
  | 'TEACHING'
  | 'RESEARCH'
  | 'CONTENT'
  | 'DESIGN'
  | 'VIDEO'
  | 'ADMIN'
  | 'WEBSITE'
  | 'STUDENT_SUPPORT'
  | 'PROJECT_MANAGEMENT'
  | 'GENERAL';

export interface AgentDefinition {
  id: AgentCategory;
  name: string;
  description: string;
  specializations: string[];
  systemPrompt: string;
  collaboratesWith?: AgentCategory[];
}

export interface RoutingResult {
  agents: AgentCategory[];
  confidence: number;
  reasoning: string;
  isMultiAgent: boolean;
  subtasks?: Subtask[];
}

export interface Subtask {
  agent: AgentCategory;
  task: string;
  dependsOn?: AgentCategory[];
}

export interface AgentResponse {
  agent: AgentCategory;
  content: string;
  subtask?: string;
}

export interface OrchestratorResult {
  finalResponse: string;
  routing: RoutingResult;
  agentResponses: AgentResponse[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  debug?: {
    routing?: RoutingResult;
    agentResponses?: AgentResponse[];
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface MemoryStore {
  user_preferences: Record<string, string>;
  brands: Record<string, BrandInfo>;
  projects: Record<string, ProjectInfo>;
  teaching: Record<string, string>;
}

export interface BrandInfo {
  name: string;
  colors?: string[];
  fonts?: string[];
  slogans?: string[];
  tone?: string;
  visualRules?: string[];
}

export interface ProjectInfo {
  name: string;
  goal?: string;
  status?: string;
  decisions?: string[];
  assets?: string[];
  nextActions?: string[];
}
