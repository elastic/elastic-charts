/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { components } from '@octokit/openapi-types';

// octokit types are impossibly bad :(
// see https://github.com/octokit/rest.js/issues/35

export type CreateCheckOptions = BaseCheckParameters & BaseCheckOptions;
export type UpdateCheckOptions = BaseCheckParameters &
  BaseCheckOptions & {
    /** check_run_id parameter */
    check_run_id: components['parameters']['check-run-id'];
  };

interface BaseCheckParameters {
  owner: components['parameters']['owner'];
  repo: components['parameters']['repo'];
}

export type CheckStatusOptions =
  | {
      /** The current status. Can be one of `queued`, `in_progress`, or `completed`. */
      status?: 'queued' | 'in_progress';
    }
  | {
      /** The time the check completed. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`. */
      completed_at: string;
      /** The current status. Can be one of `queued`, `in_progress`, or `completed`. */
      status?: 'completed';
      /**
       * **Required if you provide `completed_at` or a `status` of `completed`**. The final conclusion of the check. Can be one of `action_required`, `cancelled`, `failure`, `neutral`, `success`, `skipped`, `stale`, or `timed_out`. When the conclusion is `action_required`, additional details should be provided on the site specified by `details_url`.
       * **Note:** Providing `conclusion` will automatically set the `status` parameter to `completed`. You cannot change a check run conclusion to `stale`, only GitHub can set this.
       */
      conclusion: 'action_required' | 'cancelled' | 'failure' | 'neutral' | 'success' | 'skipped' | 'timed_out';
    }
  | {
      /** The current status. Can be one of `queued`, `in_progress`, or `completed`. */
      status: 'completed';
      /** The time the check completed. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`. */
      completed_at?: string;
      /**
       * **Required if you provide `completed_at` or a `status` of `completed`**. The final conclusion of the check. Can be one of `action_required`, `cancelled`, `failure`, `neutral`, `success`, `skipped`, `stale`, or `timed_out`. When the conclusion is `action_required`, additional details should be provided on the site specified by `details_url`.
       * **Note:** Providing `conclusion` will automatically set the `status` parameter to `completed`. You cannot change a check run conclusion to `stale`, only GitHub can set this.
       */
      conclusion: 'action_required' | 'cancelled' | 'failure' | 'neutral' | 'success' | 'skipped' | 'timed_out';
    };

export type BaseCheckOptions = {
  /** The name of the check. For example, "code-coverage". */
  name: string;
  /** The SHA of the commit. */
  head_sha: string;
  /** The URL of the integrator's site that has the full details of the check. If the integrator does not provide this, then the homepage of the GitHub app is used. */
  details_url?: string;
  /** A reference for the run on the integrator's system. */
  external_id?: string;
  /** The time that the check run began. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`. */
  started_at?: string;

  /** Check runs can accept a variety of data in the `output` object, including a `title` and `summary` and can optionally provide descriptive details about the run. See the [`output` object](https://docs.github.com/rest/reference/checks#output-object) description. */
  output?: {
    /** The title of the check run. */
    title: string;
    /** The summary of the check run. This parameter supports Markdown. */
    summary: string;
    /** The details of the check run. This parameter supports Markdown. */
    text?: string;
    /** Adds information from your analysis to specific lines of code. Annotations are visible on GitHub in the **Checks** and **Files changed** tab of the pull request. The Checks API limits the number of annotations to a maximum of 50 per API request. To create more than 50 annotations, you have to make multiple requests to the [Update a check run](https://docs.github.com/rest/reference/checks#update-a-check-run) endpoint. Each time you update the check run, annotations are appended to the list of annotations that already exist for the check run. For details about how you can view annotations on GitHub, see "[About status checks](https://help.github.com/articles/about-status-checks#checks)". See the [`annotations` object](https://docs.github.com/rest/reference/checks#annotations-object) description for details about how to use this parameter. */
    annotations?: {
      /** The path of the file to add an annotation to. For example, `assets/css/main.css`. */
      path: string;
      /** The start line of the annotation. */
      start_line: number;
      /** The end line of the annotation. */
      end_line: number;
      /** The start column of the annotation. Annotations only support `start_column` and `end_column` on the same line. Omit this parameter if `start_line` and `end_line` have different values. */
      start_column?: number;
      /** The end column of the annotation. Annotations only support `start_column` and `end_column` on the same line. Omit this parameter if `start_line` and `end_line` have different values. */
      end_column?: number;
      /** The level of the annotation. Can be one of `notice`, `warning`, or `failure`. */
      annotation_level: 'notice' | 'warning' | 'failure';
      /** A short description of the feedback for these lines of code. The maximum size is 64 KB. */
      message: string;
      /** The title that represents the annotation. The maximum size is 255 characters. */
      title?: string;
      /** Details about this annotation. The maximum size is 64 KB. */
      raw_details?: string;
    }[];
    /** Adds images to the output displayed in the GitHub pull request UI. See the [`images` object](https://docs.github.com/rest/reference/checks#images-object) description for details. */
    images?: {
      /** The alternative text for the image. */
      alt: string;
      /** The full URL of the image. */
      image_url: string;
      /** A short image description. */
      caption?: string;
    }[];
  };
  /** Displays a button on GitHub that can be clicked to alert your app to do additional tasks. For example, a code linting app can display a button that automatically fixes detected errors. The button created in this object is displayed after the check run completes. When a user clicks the button, GitHub sends the [`check_run.requested_action` webhook](https://docs.github.com/webhooks/event-payloads/#check_run) to your app. Each action includes a `label`, `identifier` and `description`. A maximum of three actions are accepted. See the [`actions` object](https://docs.github.com/rest/reference/checks#actions-object) description. To learn more about check runs and requested actions, see "[Check runs and requested actions](https://docs.github.com/rest/reference/checks#check-runs-and-requested-actions)." To learn more about check runs and requested actions, see "[Check runs and requested actions](https://docs.github.com/rest/reference/checks#check-runs-and-requested-actions)." */
  actions?: {
    /** The text to be displayed on a button in the web UI. The maximum size is 20 characters. */
    label: string;
    /** A short explanation of what this action would do. The maximum size is 40 characters. */
    description: string;
    /** A reference for the action on the integrator's system. The maximum size is 20 characters. */
    identifier: string;
  }[];
};
