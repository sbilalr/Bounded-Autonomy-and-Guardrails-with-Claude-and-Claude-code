import { Orchestrator } from './orchestrator.js';

async function main() {
  const args = process.argv.slice(2);
  const owner = args[0] || 'octocat';
  const repo = args[1] || 'Hello-World';
  const prNumber = parseInt(args[2] || '1', 10);

  console.log(`Starting multi-agent code review for ${owner}/${repo}#${prNumber}...`);

  const orchestrator = new Orchestrator();

  try {
    const report = await orchestrator.reviewPullRequest(owner, repo, prNumber);
    console.log('\n--- Review Report Summary ---');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('Review failed:', error);
    process.exit(1);
  }
}

main();
