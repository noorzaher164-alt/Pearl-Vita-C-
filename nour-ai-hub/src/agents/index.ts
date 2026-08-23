import { AgentCategory, AgentDefinition } from '../core/types';
import { teachingAgent } from './teaching';
import { researchAgent } from './research';
import { contentAgent } from './content';
import { designAgent } from './design';
import { videoAgent } from './video';
import { adminAgent } from './admin';
import { websiteAgent } from './website';
import { studentSupportAgent } from './student-support';
import { projectManagerAgent } from './project-manager';

export {
  teachingAgent,
  researchAgent,
  contentAgent,
  designAgent,
  videoAgent,
  adminAgent,
  websiteAgent,
  studentSupportAgent,
  projectManagerAgent,
};

export const agentRegistry: Record<AgentCategory, AgentDefinition> = {
  TEACHING: teachingAgent,
  RESEARCH: researchAgent,
  CONTENT: contentAgent,
  DESIGN: designAgent,
  VIDEO: videoAgent,
  ADMIN: adminAgent,
  WEBSITE: websiteAgent,
  STUDENT_SUPPORT: studentSupportAgent,
  PROJECT_MANAGEMENT: projectManagerAgent,
  GENERAL: {
    id: 'GENERAL',
    name: 'General Agent',
    description:
      'Handles general queries that do not clearly fall under any specialist agent. Provides helpful responses and routes to specialists when appropriate.',
    specializations: [],
    systemPrompt:
      'You are a helpful general assistant for Nour AI Hub. Answer the user\'s question directly. If the question would be better handled by a specialist agent, mention which agent could provide a more detailed response.',
    collaboratesWith: [],
  },
};

export function getAgent(category: AgentCategory): AgentDefinition {
  return agentRegistry[category];
}

export function getAllAgents(): AgentDefinition[] {
  return Object.values(agentRegistry);
}

export function getSpecialistAgents(): AgentDefinition[] {
  return Object.values(agentRegistry).filter((agent) => agent.id !== 'GENERAL');
}

export function getCollaborators(category: AgentCategory): AgentDefinition[] {
  const agent = agentRegistry[category];
  if (!agent.collaboratesWith || agent.collaboratesWith.length === 0) {
    return [];
  }
  return agent.collaboratesWith.map((id) => agentRegistry[id]);
}
