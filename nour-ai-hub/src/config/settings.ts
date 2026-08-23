export const APP_SETTINGS = {
  appName: 'Nour AI Hub',
  version: '1.0.0',
  defaultLanguage: 'auto' as 'en' | 'ar' | 'auto',
  debugMode: false,
  maxConversationHistory: 50,
  apiTimeout: 60000,
};

export const LLM_CONFIG = {
  provider: 'openai' as 'openai' | 'anthropic',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 4096,
};
