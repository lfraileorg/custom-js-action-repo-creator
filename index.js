const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");
const { reportError } = require('./lib/common');

const octokit = new github.GitHub(process.env.GITHUB_TOKEN);

async function run() {
  try {
    let { context } = github;
    let capabilityRepoName = core.getInput('repository_name');
    let adminToken = core.getInput('admin_token');

    const adminOctokit = new Octokit({
      auth: adminToken
    });

    let org = context.payload.organization.login;

    // Create org repo
    core.debug(`Creating capability repo: ${capabilityRepoName}...`);

    const { data: capabilityRepositoryObj } = await adminOctokit.repos.createInOrg({
      org: org,
      name: capabilityRepoName,
      description: `Capability repository for ${capabilityRepoName}`,
      auto_init: false,
      visibility: 'private'
    });

    console.log(`Created capability repo: ${capabilityRepositoryObj.name}`);

    // Provide the repository name as output
    core.setOutput('repository_name', capabilityRepoName);

  } catch (error) {
    await reportError(github, core, octokit, error.message);
  }
}

run();
