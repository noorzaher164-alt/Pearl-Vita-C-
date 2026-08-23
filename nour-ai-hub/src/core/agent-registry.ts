import { AgentCategory, AgentDefinition } from './types';
import { agentRegistry, getAgent, getAllAgents } from '../agents';

export { getAgent, getAllAgents };

export function getAgentsByCategories(categories: AgentCategory[]): AgentDefinition[] {
  return categories.map((cat) => agentRegistry[cat]).filter(Boolean);
}
