import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { REFACTORING_SUGGESTER_PROMPT } from '../prompts/index.js';

export const refactoringSuggester: AgentDefinition = {
  description: 'Identifies opportunities to modernize code structure, improve design patterns, and increase readability.',
  prompt: REFACTORING_SUGGESTER_PROMPT,
  tools: ['Read', 'Search'],
  model: 'inherit',
} as AgentDefinition;