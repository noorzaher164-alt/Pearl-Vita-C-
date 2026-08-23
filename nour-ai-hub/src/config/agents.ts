import { AgentCategory } from '../core/types';

export const AGENT_CONFIG: Record<AgentCategory, { enabled: boolean; priority: number }> = {
  TEACHING: { enabled: true, priority: 1 },
  RESEARCH: { enabled: true, priority: 2 },
  CONTENT: { enabled: true, priority: 3 },
  DESIGN: { enabled: true, priority: 4 },
  VIDEO: { enabled: true, priority: 5 },
  ADMIN: { enabled: true, priority: 6 },
  WEBSITE: { enabled: true, priority: 7 },
  STUDENT_SUPPORT: { enabled: true, priority: 8 },
  PROJECT_MANAGEMENT: { enabled: true, priority: 9 },
  GENERAL: { enabled: true, priority: 10 },
};

export const ROUTING_CONFIG = {
  confidenceThreshold: 0.3,
  maxAgentsPerRequest: 5,
  enableMultiAgent: true,
  defaultAgent: 'GENERAL' as AgentCategory,
};
