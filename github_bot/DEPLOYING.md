# Deploying

Current deployment is [manual](https://cloud.google.com/build/docs/running-builds/start-build-command-line-api), though if necessary we can build this into a [trigger](https://cloud.google.com/build/docs/automating-builds/create-manage-triggers) via pushes to `main`. As of now this is not essential and could not be tested in a PR before merging and deploying.

## Setup to deploy

We use `gcloud` CLI to build and deploy to GCP Cloud Run.

First [install](https://cloud.google.com/sdk/docs/install) and [initialize](https://cloud.google.com/sdk/docs/initializing) the Google Cloud CLI. This will require authenticating and selecting your target project. Select the `PROJECT_ID` associated with the project named `elastic-kibana`.

We use a `cloudbuild.yml` config to simplify the deploy process, see more info [here](https://cloud.google.com/build/docs/configuring-builds/create-basic-configuration). This config has defaults within the GCP console setup so changes to `cloudbuild.yml` may override options and cause the deployment to fail.

Test and make ABSOLUTELY sure it all works as expected, aka try not to break anything! When ready deploy using...

```sh
yarn deploy
```

> Any errors can be view in the logs on GCP console.
