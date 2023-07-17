/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export interface PullRequestBuildEnv {
  GITHUB_PR_NUMBER: string;
  GITHUB_PR_TARGET_BRANCH: string;
  GITHUB_PR_BASE_OWNER: string;
  GITHUB_PR_BASE_REPO: string;
  GITHUB_PR_OWNER: string;
  GITHUB_PR_REPO: string;
  GITHUB_PR_BRANCH: string;
  GITHUB_PR_TRIGGERED_SHA: string;
  GITHUB_PR_LABELS: string;
  /**
   * Indicates whether [maintainers can modify](https://help.github.com/articles/allowing-changes-to-a-pull-request-branch-created-from-a-fork/) the pull request.
   */
  GITHUB_PR_MAINTAINER_CAN_MODIFY: string;
  ECH_STEP_PLAYWRIGHT_UPDATE_SCREENSHOTS: string;
}

export interface BuildkiteTriggerBuildOptions<
  E extends Record<string, string> = Record<string, never>,
  MD extends Record<string, string> = Record<string, never>,
> {
  /**
   * trigger context, used for logging
   */
  context?: string;
  /**
   * Ref, SHA or tag to be built.
   *
   * **Note**: Before running builds on tags, make sure your agent is [fetching git tags](https://buildkite.com/docs/integrations/github#running-builds-on-git-tags).
   * @example "HEAD"
   */
  commit: string;

  /**
   * Branch the commit belongs to. This allows you to take advantage of your pipeline and step-level branch filtering rules.
   * @example "main"
   */
  branch: string;

  /**
   * A hash with a "name" and "email" key to show who created this build.
   * @defaultValue the user making the API request.
   */
  author?: {
    name: string;
    email: string;
  };

  /**
   * Force the agent to remove any existing build directory and perform a fresh checkout.
   * @defaultValue false
   */
  clean_checkout?: boolean;

  /**
   * Environment variables to be made available to the build.
   * @defaultValue {}
   */
  env?: E;

  /**
   * Run the build regardless of the pipeline’s branch filtering rules.Step branch filtering rules will still apply.
   * @defaultValue false
   */
  ignore_pipeline_branch_filters?: boolean;

  /**
   * Message for the build.
   * @example "Testing all the things :rocket:"
   */
  message?: string;

  /**
   * An object of meta-data to make available to the build.
   * @defaultValue {}
   */
  meta_data?: MD;

  /**
   * For a pull request build, the base branch of the pull request.
   * @example "main"
   */
  pull_request_base_branch?: string;

  /**
   * For a pull request build, the pull request number.
   * @example 42
   */
  pull_request_id?: number;

  /**
   * For a pull request build, the git repository of the pull request
   * @example "git://github.com/my-org/my-repo.git"
   */
  pull_request_repository?: string;
}

export interface BuildkiteBuild<
  E extends Record<string, unknown> = Record<string, never>,
  MD extends Record<string, unknown> = Record<string, never>,
  PR extends Record<string, unknown> = Record<string, never>,
> {
  id: string;
  graphql_id: string;
  url: string;
  web_url: string;
  number: number;
  state: string;
  blocked: boolean;
  message: string;
  commit: string;
  branch: string;
  env: E;
  source: string;
  creator: BuildkiteCreator;
  jobs: BuildkiteJob[];
  created_at: string;
  scheduled_at: string;
  started_at: string;
  finished_at: string;
  meta_data: MD;
  pull_request: PR;
  pipeline: BuildkitePipeline;
}

export interface BuildkiteCreator {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

export interface BuildkiteJob {
  id: string;
  type: string;
  name: string;
  step_key: string;
  agent_query_rules: string[];
  state: string;
  web_url: string;
  log_url: string;
  raw_log_url: string;
  command: string;
  soft_failed: boolean;
  exit_status: number;
  artifact_paths: string;
  agent: Agent;
  created_at: string;
  scheduled_at: string;
  runnable_at: string;
  started_at: string;
  finished_at: string;
  retried: boolean;
  retried_in_job_id: any;
  retries_count: any;
  retry_type: any;
}

export interface Agent {
  id: string;
  graphql_id: string;
  url: string;
  web_url: string;
  name: string;
  connection_state: string;
  hostname: string;
  ip_address: string;
  user_agent: string;
  creator: Creator2;
  created_at: string;
}

export interface Creator2 {
  id: string;
  graphql_id: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

export interface BuildkitePipeline {
  id: string;
  graphql_id: string;
  url: string;
  name: string;
  slug: string;
  repository: string;
  provider: BuildkiteProvider;
  skip_queued_branch_builds: boolean;
  skip_queued_branch_builds_filter: any;
  cancel_running_branch_builds: boolean;
  cancel_running_branch_builds_filter: any;
  builds_url: string;
  badge_url: string;
  created_at: string;
  scheduled_builds_count: number;
  running_builds_count: number;
  scheduled_jobs_count: number;
  running_jobs_count: number;
  waiting_jobs_count: number;
}

export interface BuildkiteProvider {
  id: string;
  webhook_url: string;
}
