/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export interface BuildkiteWebhookPayload<
  E extends Record<string, any> = Record<string, never>,
  M extends Record<string, any> = Record<string, never>,
> {
  event: string;
  build: Build<M>;
  pipeline: Pipeline<E>;
  sender: Sender;
}

export interface Build<M extends Record<string, any>> {
  id: string;
  graphql_id: string;
  url: string;
  web_url: string;
  number: number;
  state: string;
  blocked: boolean;
  blocked_state: string;
  message: string;
  commit: string;
  branch: string;
  tag: null;
  source: string;
  author: null;
  creator: Creator;
  created_at: string;
  scheduled_at: string;
  started_at: string;
  finished_at: string;
  meta_data: M & MetaData;
  pull_request: null;
  rebuilt_from: null;
}

export interface Creator {
  id: string;
  graphql_id: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

export interface MetaData {
  'buildkite:git:commit': string;
}

export interface Pipeline<E extends Record<string, any> = Record<string, never>> {
  id: string;
  graphql_id: string;
  url: string;
  web_url: string;
  name: string;
  description: string;
  slug: string;
  repository: string;
  cluster_id: null;
  branch_configuration: string;
  default_branch: string;
  skip_queued_branch_builds: boolean;
  skip_queued_branch_builds_filter: string;
  cancel_running_branch_builds: boolean;
  cancel_running_branch_builds_filter: string;
  allow_rebuilds: boolean;
  provider: Provider;
  builds_url: string;
  badge_url: string;
  created_by: Creator;
  created_at: string;
  archived_at: null;
  env: null;
  scheduled_builds_count: number;
  running_builds_count: number;
  scheduled_jobs_count: number;
  running_jobs_count: number;
  waiting_jobs_count: number;
  visibility: string;
  tags: null;
  configuration: string;
  steps: Step<E>[];
}

export interface Provider {
  id: string;
  settings: Settings;
  webhook_url: string;
}

export interface Settings {
  trigger_mode: string;
  build_pull_requests: boolean;
  pull_request_branch_filter_enabled: boolean;
  skip_builds_for_existing_commits: boolean;
  skip_pull_request_builds_for_existing_commits: boolean;
  build_pull_request_ready_for_review: boolean;
  build_pull_request_labels_changed: boolean;
  build_pull_request_forks: boolean;
  prefix_pull_request_fork_branch_names: boolean;
  build_branches: boolean;
  build_tags: boolean;
  cancel_deleted_branch_builds: boolean;
  publish_commit_status: boolean;
  publish_commit_status_per_step: boolean;
  separate_pull_request_statuses: boolean;
  publish_blocked_as_pending: boolean;
  use_step_key_as_commit_status: boolean;
  filter_enabled: boolean;
  repository: string;
  pull_request_branch_filter_configuration: string;
  filter_condition: string;
  commit_status_error_count: number;
}

export interface Step<E extends Record<string, any> = Record<string, never>> {
  type: string;
  name: string;
  command: string;
  artifact_paths: null;
  branch_configuration: null;
  env: E;
  timeout_in_minutes: null;
  agent_query_rules: string[];
  concurrency: null;
  parallelism: null;
}

export interface Sender {
  id: string;
  name: string;
}
