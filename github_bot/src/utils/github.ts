/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAppAuth } from '@octokit/auth-app';
import { components } from '@octokit/openapi-types';
import { retry } from '@octokit/plugin-retry';
import { Octokit } from '@octokit/rest';

import { getConfig } from '../config';

const allowedUsers = new Set(['nickotime']);
const allowedUserIds = new Set([
  49699333, // dependabot
  29139614, // renovate
]);
const requiredPermission = new Set(['admin', 'write']);

const MyOctokit = Octokit.plugin(retry);

export const MAIN_CI_CHECK = '@elastic/charts CI';

class Github {
  octokit: Octokit;
  orgOctokit: Octokit;
  repoParams = {
    owner: 'elastic',
    repo: 'elastic-charts',
  };

  constructor() {
    const { github } = getConfig();

    this.octokit = new MyOctokit({
      authStrategy: createAppAuth,
      auth: github.auth,
    });

    this.orgOctokit = new MyOctokit({
      auth: github.token,
    });
  }

  /**
   * Validate user on list of OR conditions
   */
  async isValidUser({ id, login: username }: components['schemas']['nullable-simple-user']): Promise<boolean> {
    // is a specific user
    if (allowedUsers.has(username) || allowedUserIds.has(id)) {
      console.log(`User ${username} on allowed list`);
      return true;
    }

    try {
      // is collaborator of elastic-charts
      const { status } = await this.orgOctokit.repos.checkCollaborator({
        ...this.repoParams,
        username,
      });
      if (status === 204) {
        return true;
      }
    } catch (error) {
      if (error.status !== 404) {
        throw new Error(error);
      }
    }

    try {
      // has write or admin permissions in elastic-charts
      const {
        status,
        data: { permission },
      } = await this.orgOctokit.repos.getCollaboratorPermissionLevel({
        ...this.repoParams,
        username,
      });
      if (status === 200 && requiredPermission.has(permission)) {
        return true;
      }
    } catch (error) {
      if (error.status !== 404) {
        throw new Error(error);
      }
    }

    try {
      // is member of elastic
      const { status } = await this.orgOctokit.orgs.checkMembershipForUser({
        org: 'elastic',
        username,
      });

      // @ts-ignore - bad status types
      if (status === 204) {
        return true;
      }
    } catch (error) {
      if (error.status !== 404) {
        throw new Error(error);
      }
    }

    console.log(`Ignoring pull request from user '${username}'`);
    return false;
  }
}

export const githubClient = new Github();
