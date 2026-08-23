import { routeRequest } from '../src/core/router';
import type { AgentCategory } from '../src/core/types';

interface TestCase {
  input: string;
  expectedAgents: AgentCategory[];
  description: string;
}

const testCases: TestCase[] = [
  {
    input: 'Explain SN1 and SN2 reactions.',
    expectedAgents: ['TEACHING'],
    description: 'Chemistry teaching question → Teaching',
  },
  {
    input: 'Find the research gap in this paper.',
    expectedAgents: ['RESEARCH'],
    description: 'Research analysis → Research',
  },
  {
    input: 'Make an Instagram campaign for my chemistry course.',
    expectedAgents: ['CONTENT', 'DESIGN'],
    description: 'Social media campaign → Content + Design',
  },
  {
    input: 'Create a storyboard for an animated chemistry reel.',
    expectedAgents: ['VIDEO', 'DESIGN'],
    description: 'Video storyboard → Video + Design',
  },
  {
    input: 'Write an email to my department.',
    expectedAgents: ['ADMIN'],
    description: 'Email writing → Admin',
  },
  {
    input: 'Design a student chemistry portal.',
    expectedAgents: ['WEBSITE', 'DESIGN'],
    description: 'Student portal → Website + Design',
  },
  {
    input: 'Plan a complete chemistry club launch.',
    expectedAgents: ['PROJECT_MANAGEMENT'],
    description: 'Large project planning → Project Manager (at minimum)',
  },
  {
    input: 'Help me understand this chemistry question.',
    expectedAgents: ['STUDENT_SUPPORT'],
    description: 'Student help → Student Support',
  },
  {
    input: 'Create a website and marketing campaign for an online course.',
    expectedAgents: ['PROJECT_MANAGEMENT'],
    description: 'Multi-domain project → includes Project Manager',
  },
];

function arraysOverlap(a: string[], b: string[]): boolean {
  return a.some((item) => b.includes(item));
}

function arraysContainAll(actual: string[], expected: string[]): boolean {
  return expected.every((item) => actual.includes(item));
}

let passed = 0;
let failed = 0;

console.log('=== Nour AI Hub Routing Tests ===\n');

for (const tc of testCases) {
  const result = routeRequest(tc.input);
  const actualAgents = result.agents;

  const hasExpected = arraysContainAll(actualAgents, tc.expectedAgents);

  if (hasExpected) {
    passed++;
    console.log(`✓ PASS: ${tc.description}`);
    console.log(`  Input: "${tc.input}"`);
    console.log(`  Expected: [${tc.expectedAgents.join(', ')}]`);
    console.log(`  Got:      [${actualAgents.join(', ')}]`);
    console.log(`  Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log('');
  } else {
    failed++;
    console.log(`✗ FAIL: ${tc.description}`);
    console.log(`  Input: "${tc.input}"`);
    console.log(`  Expected: [${tc.expectedAgents.join(', ')}]`);
    console.log(`  Got:      [${actualAgents.join(', ')}]`);
    console.log(`  Reasoning: ${result.reasoning}`);
    console.log('');
  }
}

console.log('=== Results ===');
console.log(`Passed: ${passed}/${testCases.length}`);
console.log(`Failed: ${failed}/${testCases.length}`);
console.log('');

if (failed > 0) {
  process.exit(1);
}
