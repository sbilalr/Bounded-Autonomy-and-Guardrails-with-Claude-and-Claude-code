import { query } from '@anthropic-ai/claude-agent-sdk';
import zodToJsonSchema from 'zod-to-json-schema';
import { ReviewReportSchema, ReviewReport } from './types/index.js';
import { codeQualityAnalyzer, testCoverageAnalyzer, refactoringSuggester } from './agents/index.js';
import { ORCHESTRATOR_PROMPT } from './prompts/index.js';

export class Orchestrator {
  async reviewPullRequest(owner: string, repo: string, prNumber: number): Promise<ReviewReport> {
    const jsonSchema = zodToJsonSchema(ReviewReportSchema as any, { $refStrategy: 'root' });

    const prompt = `${ORCHESTRATOR_PROMPT}\nTarget PR: Owner=${owner}, Repo=${repo}, PR #${prNumber}`;

    const stream = query({
      prompt,
      options: {
        agents: {
          'code-quality-analyzer': codeQualityAnalyzer,
          'test-coverage-analyzer': testCoverageAnalyzer,
          'refactoring-suggester': refactoringSuggester,
        },
        allowedTools: [
          'Task',
          'Skill',
          'mcp__github__pull_request_read',
          'mcp__github__issue_comment_create',
        ],
        outputFormat: {
          type: 'json_schema',
          schema: jsonSchema,
        },
        maxTurns: 20,
      },
    });

    for await (const message of stream) {
      const msg = message as any;
      if (msg.type === 'result' && msg.subtype === 'success' && msg.structured_output) {
        return msg.structured_output as ReviewReport;
      }
    }

    throw new Error('Failed to obtain structured review output from Orchestrator.');
  }
}