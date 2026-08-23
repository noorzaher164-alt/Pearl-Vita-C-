# Nour AI Hub - Usage Guide

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
cd nour-ai-hub
npm install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your API key:
```
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

Or for Anthropic:
```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Note**: Without an API key, the system runs in simulation mode with placeholder responses. The routing and UI still work fully.

### Running Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Running Tests

```bash
npx tsx tests/routing.test.ts
```

## Using the Chat Interface

### Basic Usage
1. Type your request in the input box
2. The system automatically determines which agent(s) to use
3. You receive one unified response

### Example Requests

| Request | Agents Used |
|---------|------------|
| "Explain SN1 reactions" | Teaching |
| "Find research gaps" | Research |
| "Make an Instagram post" | Content + Design |
| "Create a storyboard" | Video + Design |
| "Write an email" | Admin |
| "Design a website" | Website + Design |
| "Plan a course launch" | Project Manager + others |
| "Help with homework" | Student Support |

### Debug Mode
Toggle the "Debug Mode" checkbox in the sidebar to see:
- Which agents were selected
- Routing confidence score
- Reasoning for the routing decision
- Individual agent responses (for multi-agent requests)

### Language Support
- Write in English, Arabic, or mixed
- Egyptian Arabic is supported naturally
- Scientific terms can stay in English

## API Usage

### Chat Endpoint

```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Your request here",
  "conversationHistory": []
}
```

Response:
```json
{
  "response": "The combined response",
  "debug": {
    "routing": {
      "agents": ["TEACHING"],
      "confidence": 0.85,
      "reasoning": "...",
      "isMultiAgent": false
    }
  }
}
```

### Memory Endpoint

Read memory:
```bash
GET /api/memory
```

Update memory:
```bash
POST /api/memory
Content-Type: application/json

{
  "action": "update",
  "category": "user_preferences",
  "key": "language",
  "value": "Arabic"
}
```

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy with Vercel CLI or connect GitHub repo
```

### Docker
```bash
docker build -t nour-ai-hub .
docker run -p 3000:3000 --env-file .env.local nour-ai-hub
```

### Environment Variables for Production
Set these in your hosting platform:
- `LLM_PROVIDER` - "openai" or "anthropic"
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- `OPENAI_MODEL` or `ANTHROPIC_MODEL` (optional)
