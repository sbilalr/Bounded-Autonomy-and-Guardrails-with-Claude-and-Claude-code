import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { CODE_QUALITY_ANALYZER_PROMPT } from '../prompts/index.js';

export const codeQualityAnalyzer: AgentDefinition = {
  description: 'Analyzes source code for security vulnerabilities, performance bottlenecks, and quality issues.',
  prompt: CODE_QUALITY_ANALYZER_PROMPT,
  tools: ['Read', 'Search', 'Skill'],
  model: 'inherit',
} as AgentDefinition;