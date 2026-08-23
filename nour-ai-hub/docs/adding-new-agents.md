# Adding a New Agent

## Steps

### 1. Create the Agent Definition

Create a new file in `src/agents/your-agent.ts`:

```typescript
import { AgentDefinition } from '../core/types';

export const yourAgent: AgentDefinition = {
  id: 'YOUR_CATEGORY',  // Must be added to AgentCategory type first
  name: 'Your Agent',
  description: 'What this agent does',
  specializations: [
    'specific capability 1',
    'specific capability 2',
  ],
  systemPrompt: `You are the Your Agent...`,
  collaboratesWith: ['DESIGN', 'CONTENT'],  // Optional
};
```

### 2. Add the Category

In `src/core/types.ts`, add your category to the `AgentCategory` type:

```typescript
export type AgentCategory =
  | 'TEACHING'
  // ... existing categories
  | 'YOUR_CATEGORY';
```

### 3. Register the Agent

In `src/agents/index.ts`, import and add your agent:

```typescript
import { yourAgent } from './your-agent';

export const ALL_AGENTS: AgentDefinition[] = [
  // ... existing agents
  yourAgent,
];
```

### 4. Add Routing Keywords

In `src/core/router.ts`, add keyword mappings for your category:

```typescript
const KEYWORD_MAP: Record<AgentCategory, string[]> = {
  // ... existing mappings
  YOUR_CATEGORY: ['keyword1', 'keyword2', 'keyword3'],
};
```

### 5. Add Configuration

In `src/config/agents.ts`:

```typescript
export const AGENT_CONFIG: Record<AgentCategory, { enabled: boolean; priority: number }> = {
  // ... existing config
  YOUR_CATEGORY: { enabled: true, priority: 11 },
};
```

### 6. Add Tests

Add test cases in `tests/routing.test.ts`:

```typescript
{
  input: 'A request that should trigger your agent',
  expectedAgents: ['YOUR_CATEGORY'],
  description: 'Your test description',
},
```

### 7. Run Tests

```bash
npx tsx tests/routing.test.ts
```
