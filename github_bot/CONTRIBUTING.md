# Contributing

This GitHub app is a containerized node express application deployed on [GCP Cloud Run](https://cloud.google.com/run).

## Local development

### Install dependencies

```
cd ./github_bot/CONTRIBUTING.md
yarn install
```

### Environment Variables

We use `.env` files to run this app locally. You can access all but two of the required variables [here](https://p.elstc.co/paste/byxL670y#GBaoH3fslcdTAjo9eZdSW4anOYySjycUPL1NQGr0CBC) (must be an elastic employee). Copy this content into `github_bot/.env` file, don't worry this file is `.gitignore`'d.

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

### Setup `smee` (only if local dev fails)

[`smee.io`](https://smee.io/) tunnels *live* GitHub webhooks to localhost.

This should be setup already but if it fails you can create a new channel [here](https://smee.io/new) and update the `WEBHOOK_PROXY_URL` value in your `.env` file with the provided url.

You must also register this webhook in `elastic-charts` [here](https://github.com/elastic/elastic-charts/settings/hooks/new). Input the smee url as **Payload URL** and set **Content type** to `application/json`. Input the secret string as the value of `WEBHOOK_SECRET` from the `.env` file. For simplicity, select the `Send me everything` option for events. Make sure the **active** option is checked and click add the webhook.

### Setup ngrok (only required for developing `/buildkite` routes)

This step leverages `ngrok` for tunneling *live* buildkite webhooks to localhost. You can download it [here](https://ngrok.com/download). Follow the steps for setup.

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

I would suggest referencing the [https://probot.github.io/docs/webhooks/](probot docs) to get started.

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

Deploying requires some additional setup that is detailed in [DEPLOYING.md]
