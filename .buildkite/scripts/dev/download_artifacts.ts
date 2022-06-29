/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import path from 'path';

import axios from 'axios';
import Downloader from 'nodejs-file-downloader';

const downloadFile = async (url: string, directory: string, fileName: string) => {
  try {
    const downloader = new Downloader({
      url, //If the file name already exists, a new file with the name 200MB1.zip is created.
      directory, //This folder will be created, if it doesn't exist.
      fileName,
      headers: {
        Authorization: `Bearer ${process.env.BUILDKITE_TOKEN}`,
      },
    });
    await downloader.download();

    console.log(`✅ ${directory}/${fileName}`);
  } catch {
    console.log(`❌ ${directory}/${fileName}`);
  }
};

const getArtifactsForJob = async (buildNumber: string, jobId: string) => {
  const { data } = await axios.get<JobArifact[]>(
    `https://api.buildkite.com/v2/organizations/elastic/pipelines/elastic-charts-ci/builds/${buildNumber}/jobs/${jobId}/artifacts`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BUILDKITE_TOKEN}`,
      },
    },
  );

  return data;
};

const downloadArifactsForJob = async (buildNumber: string, jobId: string, dir?: string) => {
  const artifacts = await getArtifactsForJob(buildNumber, jobId);
  const proms = artifacts.map(({ download_url, dirname, filename }) => {
    const topDirectory = dir ?? path.resolve(__dirname, '../../../');
    const directory = path.resolve(topDirectory, dirname);

    return downloadFile(download_url, directory, filename);
  });

  await Promise.all(proms);
};

void downloadArifactsForJob('227', 'e3f83cfd-4d1a-49a0-a9c2-92d5d01f7220');

interface JobArifact {
  id: string;
  job_id: string;
  url: string;
  download_url: string;
  state: string;
  path: string;
  dirname: string;
  filename: string;
  mime_type: string;
  file_size: number;
  glob_path?: null;
  original_path?: null;
  sha1sum: string;
}
