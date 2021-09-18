"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const auth_action_1 = require("@octokit/auth-action");
const lodash_intersectionby_1 = __importDefault(require("lodash.intersectionby"));
const PR_CHECK_NAME = 'Sync';
const MATRIX_TITLE_PREFIX = 'PR #';
function getInputs() {
    return {
        baseRef: core.getInput('base-ref'),
        baseSha: core.getInput('base-sha'),
        headSha: core.getInput('head-sha'),
        statusContext: core.getInput('status-context'),
        limit: Number(core.getInput('limit')),
        prNumber: core.getInput('pr-number'),
        silent: core.getBooleanInput('silent'),
    };
}
/**
 * GitHub `pull_request` triggers automatically create a check run and lists it under the PR
 * Checks. This is a helper to grab the right urls either case, a pr or a push to a special branch.
 */
async function getCheckRunUrl(octokit, ref, isPrEvent, prNumber) {
    var _a, _b, _c, _d;
    // for pull-requests to find triggered run:
    if (isPrEvent) {
        const { data } = await octokit.rest.checks.listForRef({
            ...github.context.repo,
            check_name: PR_CHECK_NAME,
            ref,
        });
        return (_b = (_a = data.check_runs[0]) === null || _a === void 0 ? void 0 : _a.html_url) !== null && _b !== void 0 ? _b : undefined;
    }
    if (!prNumber) {
        core.warning('pr-number not defined. Must include pr-number to fetch target url for check run');
        return;
    }
    // for push to find matrix run
    const { data } = await octokit.rest.actions.listJobsForWorkflowRun({
        ...github.context.repo,
        run_id: github.context.runId,
    });
    const testString = `${MATRIX_TITLE_PREFIX}${prNumber}`;
    return (_d = (_c = data.jobs.find(({ name }) => name.startsWith(testString))) === null || _c === void 0 ? void 0 : _c.html_url) !== null && _d !== void 0 ? _d : undefined;
}
async function setStatusFn(octokit, { headSha, baseSha, statusContext: context, prNumber }) {
    const isPr = github.context.eventName.startsWith('pull_request');
    const ref = isPr ? headSha : baseSha;
    const target_url = await getCheckRunUrl(octokit, ref, isPr, prNumber);
    return (state, description) => {
        core.info(`state: ${state}`);
        core.info(`description: ${description}`);
        octokit.rest.repos.createCommitStatus({
            ...github.context.repo,
            sha: headSha,
            context,
            state,
            description,
            target_url,
        });
    };
}
const pluralWords = {
    commit: 'commits',
    screenshot: 'screenshots',
};
function pluralize(word, count) {
    return count === 1 ? word : pluralWords[word];
}
async function run() {
    const inputs = getInputs();
    const { token } = await (0, auth_action_1.createActionAuth)()();
    const octokit = await github.getOctokit(token);
    const setStatus = await setStatusFn(octokit, inputs);
    const setFailed = (msg) => inputs.silent ? core.warning(msg) : core.setFailed(msg);
    setStatus('pending', 'Checking if PR is up-to-date.');
    try {
        const { data: baseCompare } = await octokit.rest.repos.compareCommitsWithBasehead({
            ...github.context.repo,
            basehead: `${inputs.baseRef}...${inputs.baseSha}`,
        });
        if (baseCompare.behind_by === 0) {
            setStatus('success', 'PR is up-to-date with upstream base.');
            return;
        }
        if (baseCompare.behind_by > inputs.limit) {
            const message = `PR is ${baseCompare.behind_by} ${pluralize('commit', baseCompare.behind_by)} behind. Please merge with ${inputs.baseRef}`;
            setStatus('failure', message);
            setFailed(message);
            return;
        }
        const { data: headCompare } = await octokit.rest.repos.compareCommitsWithBasehead({
            ...github.context.repo,
            basehead: `${inputs.baseSha}...${inputs.headSha}`,
        });
        if (baseCompare.files && headCompare.files) {
            // files changed in base since pr last synced
            const touchedFiles = (0, lodash_intersectionby_1.default)(baseCompare.files, headCompare.files, ({ filename }) => filename);
            const vrtFiles = touchedFiles.filter(({ filename }) => filename.startsWith('integration/tests/__image_snapshots__/') && !filename.includes('/__diff_output__/'));
            const vrtFileCount = vrtFiles.length;
            if (vrtFileCount > 0) {
                const message = `PR is behind by ${baseCompare.behind_by} ${pluralize('commit', baseCompare.behind_by)} with ${vrtFileCount} stale VRT ${pluralize('screenshot', baseCompare.behind_by)}. Please merge with ${inputs.baseRef}.`;
                setStatus('failure', message);
                setFailed(message);
            }
            else {
                const message = `PR is behind by ${baseCompare.behind_by} ${pluralize('commit', baseCompare.behind_by)} with 0 stale VRT screenshots.`;
                setStatus('success', message);
            }
        }
    }
    catch (e) {
        const error = e;
        setStatus('error', 'Failed to check PR status');
        core.error(error);
        core.setFailed(error);
    }
}
run();
