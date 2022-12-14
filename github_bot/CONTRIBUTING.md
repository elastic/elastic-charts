# Contributing

This GitHub app is a containerized node express application deployed on [GCP Cloud Run](https://cloud.google.com/run).

## Local development

### Install dependencies

```
cd ./github_bot
yarn install
```

### Github Apps

There are two GitHub apps, one for testing locally and one for production. The apps are owned by elastic GitHub organization and only need to be changed or accessed for permissions, events or config changes. See @nickofthyme if you require any changes.

#### Production app

url: https://github.com/apps/elastic-datavis

This app is installed on [`@elastic/elastic-charts`](https://github.com/elastic/elastic-charts) repo and is isolated from the test environment.

See [`DEPLOYING.md`](DEPLOYING.md).

#### Testing app

url: https://github.com/apps/elastic-datavis-test


This app uses [`smee.io`](https://smee.io/) to tunnel *live* GitHub webhooks to localhost.

This app is installed on [`@elastic/datavis-ci-test`](https://github.com/elastic/datavis-ci-test) repo and is isolated from the production environment.

See [Running locally](#running-locally) section below.


### Environment Variables

We use `.env` files to run this app locally. You can access all but two of the required variables [here](https://p.elstc.co/paste/qVr+LQSn#E7OsWIHLB3uSEhaXid-I08ZAgtVD3Xgu/l980Ng3D/g) (must be an elastic employee). These values are for the testing app, prod values are not necessary here. Copy this content into `github_bot/.env` file, don't worry this file is `.gitignore`'d.

<details><summary>See example `.env` file here</summary>
<p>

Values explained more below.

```bash
# Triggers development environment
NODE_ENV=development

# PAT used for org/admin requests not granted to elastic-charts bot
GITHUB_TOKEN=<INPUT_YOUR_TOKEN_HERE>

# Used to make api requests
BUILDKITE_TOKEN=<INPUT_YOUR_TOKEN_HERE>

# Proxy tunnel used to reroute GitHub webhooks to localhost
WEBHOOK_PROXY_URL=https://smee.io/***
WEBHOOK_SECRET=***

# Nonce to somewhat secure buildkite webhook urls
BUILDKITE_WEBHOOK_NONCE=***

# GitHub App authentication json for elastic-charts bot
# See https://github.com/apps/elastic-charts
GITHUB_AUTH='{...}'
```

</p>
</details>

You must obtain the `GITHUB_TOKEN` and `BUILDKITE_TOKEN` values by creating these personal access tokens manually.

Create a new `GITHUB_TOKEN` [here](https://github.com/settings/tokens/new) and set it in `.env` file. Currently the only required scope is `read:org`.

Create a new `BUILDKITE_TOKEN` [here](https://buildkite.com/user/api-access-tokens/new) and set it in `.env` file. Make sure the token has the following access:

- Organizations: Elastic
- REST Scopes: read_agents, read_artifacts, read_builds, write_builds, read_build_logs, read_pipelines
- GraphQL Access: Enabled

In addition to `.env` file, we also use `github_bot/src/env.ts` file to select a set of environment variables that applies differently to the test app than it does the production app.

### Setup ngrok (only required for developing `/buildkite` routes)

This step leverages `ngrok` for tunneling *live* buildkite webhooks to localhost. You can download it [here](https://ngrok.com/download). Follow the steps for setup.

Then to test this add this webhook url to the buildkite pipeline config [here](https://buildkite.com/elastic/datavis-ci/steps) and save it.

```yml
notify:
  - webhook: "https://<some-id>.ngrok.io"
```

## Running locally

### Start ngrok tunnel (only required for developing `/buildkite` routes)

```bash
# leave this running in a separate terminal shell
ngrok http 3000
```

### Start app

Start the express app to listen on port `3000`. This will restart on file changes.

```
yarn dev // watch mode
// or
yarn start // non-watch mode
```

From here you are now running the full service on your local machine and handling live data from GitHub so be mindful of changes you make and api calls your run.

I would suggest referencing the [probot docs](https://probot.github.io/docs/webhooks/) to get started.

> The deployed instance will **_not_** stop receiving requests while you are running a local development instance. This is necessary to avoid missing actionable events.
>
> To help bifurcate this flow of requests, the [`dev-ci`]() pull request label is used. Thus, the local development instance ignores events _without_ the `dev-ci` label, while the deployed instance ignores all events _with_ the `dev-ci` label.
>
> Note, this only applies to `pull_request` events, we could apply a similar approach to other events if needed.

## Build app

The final app is transpiled to javascript in the `Dockerfile` via `yarn build`.

You can test the docker build process by running...

```bash
yarn build:docker
# run docker image with all required environment variables in `.env`
docker run datavis-github-bot:local -e PORT=3000 -e NODE_ENV=production -e ...
```

## Deploy to GCP Cloud Run

Deploying requires some additional setup that is detailed in [`DEPLOYING.md`](DEPLOYING.md)
