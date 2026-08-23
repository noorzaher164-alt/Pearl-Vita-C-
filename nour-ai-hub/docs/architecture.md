# Nour AI Hub - Architecture

## Overview

Nour AI Hub is a modular AI assistant system built with a master orchestrator pattern. Users interact with ONE assistant that automatically routes requests to specialized agents.

## System Architecture

```
User Request
    │
    ▼
┌─────────────┐
│  Master API  │  (/api/chat)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Router     │  Classifies intent, selects agents
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Orchestrator │  Coordinates agents, combines outputs
└──────┬───────┘
       │
       ├──► Teaching Agent
       ├──► Research Agent
       ├──► Content Agent
       ├──► Design Agent
       ├──► Video Agent
       ├──► Admin Agent
       ├──► Website Agent
       ├──► Student Support Agent
       └──► Project Manager Agent
              │
              ▼
       Combined Response
              │
              ▼
         User Response
```

## Core Components

### Router (`src/core/router.ts`)
- Keyword-based + pattern analysis routing
- Supports multi-agent routing
- Confidence scoring
- Arabic and English keyword detection
- Returns `RoutingResult` with selected agents and reasoning

### Orchestrator (`src/core/orchestrator.ts`)
- Single-agent: direct pass-through
- Multi-agent: parallel execution + LLM-based combination
- Uses Master Agent prompt to merge outputs coherently
- Hides internal agent routing from the user

### Agent Registry (`src/core/agent-registry.ts`)
- Central registry of all agent definitions
- Lookup by category or get all agents
- Each agent has: id, name, description, specializations, systemPrompt

### Memory (`src/core/memory.ts`)
- In-memory store with categories: user_preferences, brands, projects, teaching
- CRUD operations via API (`/api/memory`)
- JSON serializable

## Agent Categories

| Category | Agent | Purpose |
|----------|-------|---------|
| TEACHING | Teaching Agent | Lessons, worksheets, quizzes, curriculum |
| RESEARCH | Research Agent | Academic research, literature review, citations |
| CONTENT | Content Agent | Social media, campaigns, content calendars |
| DESIGN | Design Agent | Visual concepts, brand identity, image prompts |
| VIDEO | Video Agent | Storyboards, scripts, video production |
| ADMIN | Admin Agent | Emails, meeting notes, documents |
| WEBSITE | Website Agent | Web structure, UX, landing pages |
| STUDENT_SUPPORT | Student Support | Tutoring, explanations, study plans |
| PROJECT_MANAGEMENT | Project Manager | Multi-step project coordination |
| GENERAL | General | Fallback for unclassified requests |

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **LLM**: OpenAI or Anthropic (configurable)
- **Storage**: In-memory + localStorage (client-side conversations)

## API Routes

- `POST /api/chat` - Main chat endpoint
- `GET /api/memory` - Read memory
- `POST /api/memory` - Update/delete/reset memory

## Directory Structure

```
nour-ai-hub/
├── src/
│   ├── agents/          # Agent definitions
│   ├── core/            # Router, orchestrator, memory, registry
│   ├── config/          # Configuration files
│   ├── prompts/         # Global rules and routing rules
│   ├── components/      # React UI components
│   └── app/             # Next.js pages and API routes
├── tests/               # Routing and agent tests
├── docs/                # Documentation
└── memory/              # Memory storage
```
