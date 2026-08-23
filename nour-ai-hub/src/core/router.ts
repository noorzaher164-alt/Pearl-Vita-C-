import { AgentCategory, RoutingResult, Subtask } from './types';
import { ROUTING_RULES } from '../prompts/global-rules';
import { ROUTING_CONFIG } from '../config/agents';

// ---------------------------------------------------------------------------
// Keyword maps -- English and Arabic terms that signal each category
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<AgentCategory, string[]> = {
  TEACHING: [
    // English
    'lesson', 'worksheet', 'quiz', 'exam', 'curriculum', 'teach',
    'classroom', 'learning objectives', 'revision', 'cheat sheet',
    'lesson plan', 'assessment', 'answer key', 'marking scheme',
    'differentiation', 'warm-up', 'plenary', 'scheme of work',
    'learning outcome', 'activity', 'handout', 'rubric',
    'explain', 'reaction', 'chemistry', 'concept', 'mechanism',
    'organic', 'inorganic', 'equation', 'molecule', 'bond',
    'element', 'compound', 'periodic table', 'titration', 'mole',
    'stoichiometry', 'thermodynamics', 'kinetics', 'equilibrium',
    'acid', 'base', 'oxidation', 'reduction', 'electrolysis',
    // Arabic
    'درس', 'ورقة عمل', 'امتحان', 'منهج',
    'تدريس', 'فصل', 'مراجعة', 'كويز',
    'أهداف التعلم', 'خطة درس', 'نشاط',
    'تقييم', 'أسئلة', 'كيمياء', 'تفاعل',
  ],
  RESEARCH: [
    'research', 'literature', 'methodology', 'citation', 'journal',
    'academic', 'paper', 'doi', 'hypothesis', 'peer review',
    'systematic review', 'meta-analysis', 'abstract', 'bibliography',
    'thesis', 'dissertation', 'references', 'scholarly', 'findings',
    'literature review', 'research question', 'data analysis',
    // Arabic
    'بحث', 'مراجعة أدبيات', 'منهجية',
    'استشهاد', 'مجلة علمية', 'أكاديمي',
    'رسالة', 'فرضية', 'تحليل بيانات',
    'مصادر', 'ورقة بحثية',
  ],
  CONTENT: [
    'instagram', 'tiktok', 'social media', 'caption', 'hook',
    'campaign', 'reel', 'content calendar', 'brand content', 'ad copy',
    'hashtag', 'post', 'engagement', 'copywriting', 'blog',
    'newsletter', 'content strategy', 'carousel', 'story', 'threads',
    'twitter', 'x post', 'linkedin', 'facebook',
    // Arabic
    'محتوى', 'سوشيال ميديا', 'بوست',
    'كابشن', 'كامبين', 'اعلان',
    'تقويم محتوى', 'منشور', 'هاشتاج',
    'ريلز', 'محتوى رقمي',
  ],
  DESIGN: [
    'design', 'brand', 'color', 'colour', 'typography', 'logo',
    'visual', 'palette', 'layout', 'poster', 'packaging',
    'brand identity', 'font', 'image prompt', 'mood board',
    'wireframe', 'mockup', 'graphic', 'banner', 'flyer',
    'infographic', 'icon', 'illustration', 'branding',
    // Arabic
    'تصميم', 'براند', 'ألوان', 'شعار',
    'هوية بصرية', 'خطوط', 'بوستر',
    'تغليف', 'إنفوجرافيك', 'بانر',
  ],
  VIDEO: [
    'video', 'storyboard', 'scene', 'animation', 'animated', 'reel script',
    'shot list', 'camera', 'narration', 'film', 'motion graphics',
    'b-roll', 'transition', 'voiceover', 'cinematic', 'footage',
    'editing', 'premiere', 'after effects', 'script video', 'reel',
    // Arabic
    'فيديو', 'مشهد', 'سيناريو', 'رسوم متحركة',
    'كاميرا', 'تعليق صوتي', 'مونتاج',
    'تصوير', 'إخراج', 'انيميشن',
  ],
  ADMIN: [
    'email', 'meeting', 'schedule', 'checklist', 'policy',
    'memo', 'internal', 'organize', 'template', 'agenda',
    'minutes', 'task list', 'deadline', 'reminder', 'report',
    'documentation', 'procedure', 'sop', 'filing', 'database',
    // Arabic
    'إيميل', 'اجتماع', 'جدول', 'سياسة',
    'مذكرة', 'مهام', 'تنظيم', 'تقرير',
    'موعد', 'محضر', 'نموذج',
  ],
  WEBSITE: [
    'website', 'landing page', 'portal', 'ux', 'ui',
    'dashboard', 'web app', 'user flow', 'feature', 'homepage',
    'navigation', 'responsive', 'frontend', 'backend', 'api',
    'sitemap', 'seo', 'web design', 'page structure', 'prototype',
    // Arabic
    'موقع', 'صفحة هبوط', 'بورتال',
    'تطبيق ويب', 'واجهة', 'تصميم موقع',
    'صفحة رئيسية', 'لوحة تحكم',
  ],
  STUDENT_SUPPORT: [
    'help me understand', 'explain this', 'homework', 'study',
    'tutor', 'practice question', 'revision', 'solve this',
    'step by step', 'confused about', 'i don\'t understand',
    'can you explain', 'how does', 'what is', 'why does',
    'study plan', 'exam prep', 'flashcards', 'summary',
    // Arabic
    'فهمني', 'اشرحلي', 'واجب', 'مذاكرة',
    'تدريب', 'سؤال', 'مش فاهم', 'ازاي',
    'يعني ايه', 'حل السؤال', 'امتحانات',
  ],
  PROJECT_MANAGEMENT: [
    'plan', 'launch', 'phases', 'milestones', 'project',
    'timeline', 'dependencies', 'deliverables', 'roadmap',
    'sprint', 'gantt', 'action plan', 'coordination',
    'stakeholder', 'scope', 'kickoff', 'retrospective',
    // Arabic
    'خطة', 'إطلاق', 'مراحل', 'مشروع',
    'جدول زمني', 'مهام', 'تنسيق', 'تسليمات',
  ],
  GENERAL: [
    'hi', 'hello', 'thanks', 'thank you', 'hey', 'good morning',
    'good evening', 'how are you', 'what can you do', 'help',
    'who are you', 'bye', 'goodbye',
    // Arabic
    'أهلا', 'مرحبا', 'شكرا', 'صباح الخير',
    'مساء الخير', 'ازيك', 'ايه الاخبار',
    'مين انت', 'مع السلامة',
  ],
};

// ---------------------------------------------------------------------------
// Multi-word phrases that get bonus weight (they are more specific signals)
// ---------------------------------------------------------------------------

const HIGH_CONFIDENCE_PHRASES: Record<AgentCategory, string[]> = {
  TEACHING: ['lesson plan', 'learning objectives', 'cheat sheet', 'answer key', 'scheme of work', 'خطة درس', 'sn1 and sn2', 'sn1', 'sn2', 'organic chemistry', 'periodic table'],
  RESEARCH: ['literature review', 'peer review', 'research question', 'systematic review', 'مراجعة أدبيات'],
  CONTENT: ['content calendar', 'ad copy', 'social media', 'brand content', 'سوشيال ميديا'],
  DESIGN: ['brand identity', 'color palette', 'image prompt', 'mood board', 'هوية بصرية'],
  VIDEO: ['reel script', 'shot list', 'motion graphics', 'رسوم متحركة', 'تعليق صوتي'],
  ADMIN: ['task list', 'meeting agenda', 'محضر اجتماع'],
  WEBSITE: ['landing page', 'user flow', 'web app', 'student portal', 'chemistry portal', 'portal', 'صفحة هبوط', 'تصميم موقع'],
  STUDENT_SUPPORT: ['help me understand', 'explain this', 'practice question', 'step by step', 'مش فاهم'],
  PROJECT_MANAGEMENT: ['action plan', 'project plan', 'جدول زمني'],
  GENERAL: ['how are you', 'what can you do', 'ايه الاخبار'],
};

// ---------------------------------------------------------------------------
// Multi-agent trigger patterns
// ---------------------------------------------------------------------------

const MULTI_AGENT_CONNECTORS = [
  ' and ', ' with ', ' plus ', ' also ', ' then ',
  ' و ', ' مع ', ' كمان ', ' وكمان ', ' وبعدين ',
];

// ---------------------------------------------------------------------------
// Language detection
// ---------------------------------------------------------------------------

interface LanguageInfo {
  language: 'en' | 'ar' | 'mixed';
  arabicRatio: number;
}

function detectLanguage(text: string): LanguageInfo {
  const arabicPattern = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
  const latinPattern = /[a-zA-Z]/g;

  const arabicMatches = text.match(arabicPattern) || [];
  const latinMatches = text.match(latinPattern) || [];

  const total = arabicMatches.length + latinMatches.length;
  if (total === 0) return { language: 'en', arabicRatio: 0 };

  const arabicRatio = arabicMatches.length / total;

  if (arabicRatio > 0.7) return { language: 'ar', arabicRatio };
  if (arabicRatio > 0.2) return { language: 'mixed', arabicRatio };
  return { language: 'en', arabicRatio };
}

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

interface CategoryScore {
  category: AgentCategory;
  score: number;
  matchedKeywords: string[];
}

function scoreCategories(message: string): CategoryScore[] {
  const lower = message.toLowerCase();
  const scores: CategoryScore[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [AgentCategory, string[]][]) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Check high-confidence phrases first (worth 3 points each)
    const phrases = HIGH_CONFIDENCE_PHRASES[category] || [];
    for (const phrase of phrases) {
      if (lower.includes(phrase.toLowerCase())) {
        score += 3;
        matchedKeywords.push(phrase);
      }
    }

    // Check individual keywords (worth 1 point each, skip if already matched via phrase)
    for (const keyword of keywords) {
      const kw = keyword.toLowerCase();
      if (lower.includes(kw) && !matchedKeywords.some((m) => m.toLowerCase().includes(kw))) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }

    if (score > 0) {
      scores.push({ category, score, matchedKeywords });
    }
  }

  // Sort descending by score
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

// ---------------------------------------------------------------------------
// Multi-agent detection
// ---------------------------------------------------------------------------

function detectsMultipleIntents(message: string): boolean {
  const lower = message.toLowerCase();
  return MULTI_AGENT_CONNECTORS.some((c) => lower.includes(c));
}

function shouldIncludeProjectManagement(message: string, agents: AgentCategory[]): boolean {
  if (agents.includes('PROJECT_MANAGEMENT')) return false;

  const lower = message.toLowerCase();
  const scopeWords = ['build', 'launch', 'create', 'develop', 'produce', 'ابني', 'اطلق', 'اعمل'];
  const scaleWords = ['full', 'complete', 'entire', 'whole', 'big', 'كامل', 'كبير'];

  const hasScopeWord = scopeWords.some((w) => lower.includes(w));
  const hasScaleWord = scaleWords.some((w) => lower.includes(w));

  // Large-scope project, or multi-agent with a scope word
  return (hasScopeWord && hasScaleWord) || (hasScopeWord && agents.length >= 2) || agents.length >= 3;
}

function shouldIncludeDesign(message: string, agents: AgentCategory[]): boolean {
  if (agents.includes('DESIGN')) return false;

  const lower = message.toLowerCase();
  const visualHints = ['visual', 'look', 'style', 'brand', 'color', 'colour', 'campaign', 'poster', 'banner', 'layout', 'شكل', 'لون', 'بصري', 'كامبين'];
  const contentAgents: AgentCategory[] = ['CONTENT', 'VIDEO', 'WEBSITE'];
  const hasContentAgent = agents.some((a) => contentAgents.includes(a));
  return (hasContentAgent && visualHints.some((w) => lower.includes(w))) ||
    agents.includes('WEBSITE') ||
    agents.includes('VIDEO');
}

// ---------------------------------------------------------------------------
// Subtask generation
// ---------------------------------------------------------------------------

function generateSubtasks(message: string, agents: AgentCategory[]): Subtask[] {
  if (agents.length <= 1) return [];

  const subtasks: Subtask[] = [];

  // PROJECT_MANAGEMENT always comes first if present -- it coordinates
  if (agents.includes('PROJECT_MANAGEMENT')) {
    subtasks.push({
      agent: 'PROJECT_MANAGEMENT',
      task: 'Create a structured plan and coordination strategy for this multi-part request.',
    });
  }

  // RESEARCH early -- other agents may depend on findings
  if (agents.includes('RESEARCH')) {
    subtasks.push({
      agent: 'RESEARCH',
      task: 'Gather relevant research, references, and evidence for the request.',
      dependsOn: agents.includes('PROJECT_MANAGEMENT') ? ['PROJECT_MANAGEMENT'] : undefined,
    });
  }

  // Content / Teaching / Student Support / Admin in the middle layer
  for (const cat of ['TEACHING', 'STUDENT_SUPPORT', 'CONTENT', 'ADMIN', 'WEBSITE'] as AgentCategory[]) {
    if (agents.includes(cat)) {
      const deps: AgentCategory[] = [];
      if (agents.includes('PROJECT_MANAGEMENT')) deps.push('PROJECT_MANAGEMENT');
      if (agents.includes('RESEARCH')) deps.push('RESEARCH');
      subtasks.push({
        agent: cat,
        task: `Handle the ${cat.toLowerCase().replace('_', ' ')} aspects of this request.`,
        dependsOn: deps.length > 0 ? deps : undefined,
      });
    }
  }

  // DESIGN depends on content being defined
  if (agents.includes('DESIGN')) {
    const deps = agents.filter((a) => a !== 'DESIGN' && a !== 'VIDEO');
    subtasks.push({
      agent: 'DESIGN',
      task: 'Create visual concepts and design specifications for the deliverables.',
      dependsOn: deps.length > 0 ? deps : undefined,
    });
  }

  // VIDEO typically comes last -- needs script, design, etc.
  if (agents.includes('VIDEO')) {
    const deps = agents.filter((a) => a !== 'VIDEO');
    subtasks.push({
      agent: 'VIDEO',
      task: 'Develop video concepts, storyboards, or scripts based on the other outputs.',
      dependsOn: deps.length > 0 ? deps : undefined,
    });
  }

  // GENERAL is standalone
  if (agents.includes('GENERAL') && !subtasks.some((s) => s.agent === 'GENERAL')) {
    subtasks.push({ agent: 'GENERAL', task: 'Respond to the general/conversational part of the request.' });
  }

  return subtasks;
}

// ---------------------------------------------------------------------------
// Confidence calculation
// ---------------------------------------------------------------------------

function calculateConfidence(scores: CategoryScore[], selectedAgents: AgentCategory[]): number {
  if (scores.length === 0) return 0.1; // Fallback to GENERAL with low confidence

  const topScore = scores[0].score;

  // Base confidence from the strength of keyword matches
  let confidence: number;
  if (topScore >= 6) {
    confidence = 0.95;
  } else if (topScore >= 4) {
    confidence = 0.85;
  } else if (topScore >= 3) {
    confidence = 0.75;
  } else if (topScore >= 2) {
    confidence = 0.6;
  } else {
    confidence = 0.4;
  }

  // Slight penalty for many agents (harder to be sure about all of them)
  if (selectedAgents.length > 2) {
    confidence -= 0.05 * (selectedAgents.length - 2);
  }

  return Math.max(0.1, Math.min(1.0, confidence));
}

// ---------------------------------------------------------------------------
// Build reasoning explanation
// ---------------------------------------------------------------------------

function buildReasoning(
  scores: CategoryScore[],
  selectedAgents: AgentCategory[],
  languageInfo: LanguageInfo,
  wasMultiIntentDetected: boolean,
): string {
  const parts: string[] = [];

  parts.push(`Language detected: ${languageInfo.language} (Arabic ratio: ${(languageInfo.arabicRatio * 100).toFixed(0)}%).`);

  if (scores.length === 0) {
    parts.push('No strong keyword matches found. Falling back to GENERAL agent.');
    return parts.join(' ');
  }

  const topMatches = scores.slice(0, 3).map(
    (s) => `${s.category} (score ${s.score}, matched: ${s.matchedKeywords.join(', ')})`,
  );
  parts.push(`Top keyword matches: ${topMatches.join('; ')}.`);

  if (wasMultiIntentDetected) {
    parts.push('Multi-intent connectors detected in the message.');
  }

  if (selectedAgents.includes('PROJECT_MANAGEMENT') && !scores.some((s) => s.category === 'PROJECT_MANAGEMENT')) {
    parts.push('PROJECT_MANAGEMENT added because the request spans multiple agents or has large scope.');
  }

  if (selectedAgents.includes('DESIGN') && !scores.some((s) => s.category === 'DESIGN' && s.score > 0)) {
    parts.push('DESIGN added because visual cues were detected alongside other agents.');
  }

  parts.push(`Selected agents: ${selectedAgents.join(', ')}.`);

  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Main routing function
// ---------------------------------------------------------------------------

export function routeRequest(message: string, context?: string): RoutingResult {
  const input = context ? `${message} ${context}` : message;
  const languageInfo = detectLanguage(input);
  const scores = scoreCategories(input);
  const isMultiIntent = detectsMultipleIntents(input);

  let selectedAgents: AgentCategory[] = [];

  if (scores.length === 0) {
    // No keyword matches at all -- default to GENERAL
    selectedAgents = [ROUTING_CONFIG.defaultAgent];
  } else if (isMultiIntent && scores.length >= 2) {
    // Multi-intent: take all categories above a relative threshold
    const threshold = scores[0].score * 0.4;
    selectedAgents = scores
      .filter((s) => s.score >= threshold)
      .map((s) => s.category)
      .slice(0, ROUTING_CONFIG.maxAgentsPerRequest);
  } else {
    // Single-intent: take the top category, plus a second if it is very close
    selectedAgents = [scores[0].category];
    if (scores.length >= 2 && scores[1].score >= scores[0].score * 0.7) {
      selectedAgents.push(scores[1].category);
    }
  }

  // Apply priority rules from ROUTING_RULES
  if (shouldIncludeProjectManagement(input, selectedAgents)) {
    selectedAgents.push('PROJECT_MANAGEMENT');
  }
  if (shouldIncludeDesign(input, selectedAgents)) {
    selectedAgents.push('DESIGN');
  }

  // Cap the agent count
  selectedAgents = selectedAgents.slice(0, ROUTING_CONFIG.maxAgentsPerRequest);

  const isMultiAgent = selectedAgents.length > 1;
  const confidence = calculateConfidence(scores, selectedAgents);
  const subtasks = isMultiAgent ? generateSubtasks(input, selectedAgents) : undefined;
  const reasoning = buildReasoning(scores, selectedAgents, languageInfo, isMultiIntent);

  return {
    agents: selectedAgents,
    confidence,
    reasoning,
    isMultiAgent,
    subtasks: subtasks && subtasks.length > 0 ? subtasks : undefined,
  };
}

// Re-export for testing/debugging convenience
export { detectLanguage, scoreCategories, CATEGORY_KEYWORDS };
