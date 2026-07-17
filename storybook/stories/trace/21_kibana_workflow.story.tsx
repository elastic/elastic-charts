/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { TraceDatum } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// The three workflow IDs found in this execution. Each becomes a distinct palette color.
const ROOT_WORKFLOW = 'c278a243-49ef-4572-b0fa-767eafee0732';
const CHILD_WORKFLOW_A = '73368380-2ad9-465c-8b5e-6657d8a90a72';
const CHILD_WORKFLOW_B = 'e6ba88f7-eec8-4602-a81b-574dbdc87b0d';

/** Each span carries its owning workflow id in meta so the colorBy accessor can group them. */
const DATA: TraceDatum[] = [
  // ── Root Workflow ──────────────────────────────────────────────────────────
  {
    id: ROOT_WORKFLOW,
    name: 'Trace Debug: Root Workflow',
    start: 1784283974785,
    end: 1784284006933,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: '20ab52e0d452cb20ae0db36fbe462110b5df6099af456c3b2a41e56ad21a7157',
    name: 'initialize [data.set]',
    start: 1784283974805,
    end: 1784283974806,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: 'ea741130fdad4bb3d32eb363fc1e264fb7602f9c6fb7b54e42037498d6f8c9cb',
    name: 'quick_pause [wait]',
    start: 1784283974852,
    end: 1784283975964,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: '60f50ae9dc0269e2f103277bb142786755d01bfebda6085d70622d3f7670cd28',
    name: 'select_path [if]',
    start: 1784283975993,
    end: 1784283978139,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: '419a7da4cdc7d773c4b9a862e15057eecd2ae4dc34211f40a6af550941a279c6',
    name: 'check_slow_mode [if]',
    start: 1784283976018,
    end: 1784283978122,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: '0c60fda9209a9e5343fceaa04cd003eeb5b40823a8f7bb9aa59429d0f4ba51a8',
    name: 'normal_delay [wait]',
    start: 1784283976043,
    end: 1784283978085,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: '4c788626cafe2e38920eabd1f7def54ea632104305e6e8050d5ece33a658e432',
    name: 'normal_action [data.set]',
    start: 1784283978104,
    end: 1784283978105,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: 'd39345669858fb289421959275c1b5d91beeb510711488726aaec8bd4d9f53d2',
    name: 'parallel_enrichment [parallel]',
    start: 1784283978154,
    end: 1784283983809,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: '57bc956bd9e5e08ec235b65153baa71b096b561423d3e89e0186a338f7943bf2',
    name: 'lookup_result [data.set]',
    start: 1784283978155,
    end: 1784283978155,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: 'b42ccb3f4ddefe92efd64c8a6ee233476092315bb33314007dc77b6bda87e33f',
    name: 'analysis_delay [wait]',
    start: 1784283978155,
    end: 1784283983807,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: 'd184e6b4e5977325810439c2c332bf61a038aaea0d55efe75239dec764c17daf',
    name: 'analysis_result [data.set]',
    start: 1784283983808,
    end: 1784283983808,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: '95a8b8545feb325624bcac2b6da6cbf6e5c0d746ac9f3b30ac08d39ac91018ca',
    name: 'run_child_a [workflow.execute]',
    start: 1784283983841,
    end: 1784284001782,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  // ── Child Workflow A ───────────────────────────────────────────────────────
  {
    id: CHILD_WORKFLOW_A,
    name: 'Trace Debug: Child Workflow A',
    start: 1784283986811,
    end: 1784283998875,
    parentId: '95a8b8545feb325624bcac2b6da6cbf6e5c0d746ac9f3b30ac08d39ac91018ca',
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A },
  },
  {
    id: '60b81b38416bd1e516f402c5469ffff6b9db5f5c756b3c931d7a76aae337f86e',
    name: 'setup [data.set]',
    start: 1784283986827,
    end: 1784283986827,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A },
  },
  {
    id: 'ce526d43aceeb9efefb965d6a59f2103ca6547e6d5d6a40d0ecf9bf31a2c26ab',
    name: 'medium_pause [wait]',
    start: 1784283986850,
    end: 1784283988935,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A },
  },
  {
    id: 'b2f1ee63d6dfccd5ee7f4ca87bad69a6055d8553c90bd2fc86422115896f5989',
    name: 'extra_work_gate [if]',
    start: 1784283988963,
    end: 1784283991080,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A },
  },
  {
    id: 'ead9bab007d70dcd49b8ef9bdb44fe5b27ec8649dfec3d629df798a4d61ae257',
    name: 'extra_wait [wait]',
    start: 1784283988986,
    end: 1784283991040,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A },
  },
  {
    id: '2beff2680f368d2abacf8f3256526c3df9b530c50d167b41225f85b736213001',
    name: 'extra_data [data.set]',
    start: 1784283991058,
    end: 1784283991059,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A },
  },
  {
    id: '97d6d93efb7c9846939bdc36bcaf53df827528ee1f18c484b7f3f6875012e900',
    name: 'run_child_b [workflow.execute]',
    start: 1784283991100,
    end: 1784283998786,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A },
  },
  // ── Child Workflow B ───────────────────────────────────────────────────────
  {
    id: CHILD_WORKFLOW_B,
    name: 'Trace Debug: Child Workflow B',
    start: 1784283992743,
    end: 1784283995962,
    parentId: '97d6d93efb7c9846939bdc36bcaf53df827528ee1f18c484b7f3f6875012e900',
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_B },
  },
  {
    id: 'cf0760e2bbefeded91161931a6f961ff12c3504306318b854ceaa3f9a219a8a9',
    name: 'setup [data.set]',
    start: 1784283992777,
    end: 1784283992778,
    parentId: CHILD_WORKFLOW_B,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_B },
  },
  {
    id: '1dfb17714f0c4063c6325accdac86ac2415b57cf405c7bc97c6583136d17da65',
    name: 'slow_processing [wait]',
    start: 1784283992802,
    end: 1784283995847,
    parentId: CHILD_WORKFLOW_B,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_B },
  },
  {
    id: 'bf1351d2a04d82793895022e91fc8234ca61de6ed7eaf0903b82ef9cbaaa7571',
    name: 'finalize [data.set]',
    start: 1784283995869,
    end: 1784283995870,
    parentId: CHILD_WORKFLOW_B,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_B },
  },
  {
    id: '59872cbed31c0593a9825e61619d5a42e4ddb8d9e8ccd5e9003d8db3dea3673a',
    name: 'done [workflow.output]',
    start: 1784283995890,
    end: 1784283995891,
    parentId: CHILD_WORKFLOW_B,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_B },
  },
  // ── Back to Child A ────────────────────────────────────────────────────────
  {
    id: '8ac04b6e75625e3d9cd66209b7a0f3cb1b2dbc08b9eb14695323948e9ae6d658',
    name: 'done [workflow.output]',
    start: 1784283998815,
    end: 1784283998816,
    parentId: CHILD_WORKFLOW_A,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: CHILD_WORKFLOW_A },
  },
  // ── Back to Root ───────────────────────────────────────────────────────────
  {
    id: '6d01bbdf6806a63a42fa8798931814db36159ef8f835ea17198142078eb36d40',
    name: 'final_pause [wait]',
    start: 1784284001798,
    end: 1784284006856,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
  {
    id: '041090e27a3824ac239bdc8dcbf37e4d89464e1775eb774ed935961ab3253b8e',
    name: 'done [workflow.output]',
    start: 1784284006881,
    end: 1784284006881,
    parentId: ROOT_WORKFLOW,
    traceId: ROOT_WORKFLOW,
    meta: { workflowId: ROOT_WORKFLOW },
  },
];

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description} size={{ width: '100%', height: 600 }}>
    <Settings baseTheme={useBaseTheme()} />
    <Trace
      id="trace_kibana_workflow"
      data={DATA}
      xScaleType="linear"
      traceId={ROOT_WORKFLOW}
      colorBy={(datum) => {
        /** Groups all spans belonging to the same workflow instance by its id. */
        const meta = datum.meta as { workflowId?: string } | undefined;
        return meta?.workflowId;
      }}
    />
  </Chart>
);

Example.parameters = {
  markdown:
    'Kibana workflow execution trace with three nested workflow instances ' +
    '(`Root → Child A → Child B`), colored by workflow id via a custom `TraceColorAccessor`. ' +
    'Each span carries `meta.workflowId` set to the UUID of its owning workflow; ' +
    '`BY_WORKFLOW_ID` reads that field and returns it as the color-group key, ' +
    'so all spans in the same workflow share a palette color regardless of step type. ' +
    `Total duration ~32 s. Workflow ids: Root \`${ROOT_WORKFLOW}\`, ` +
    `Child A \`${CHILD_WORKFLOW_A}\`, Child B \`${CHILD_WORKFLOW_B}\`.`,
};
