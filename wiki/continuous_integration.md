# Datavis Continuous integration

We now use buildkite to handle `pull_request` and `push` events for our Continuous integration.

All interactions with pull requests or pushes are automated to provide a seamless experience and connection to buildkite builds and jobs. The main `@elastic/datavis CI` check run is used to indicate the overall status of the build as a whole.

> The [Publish a Release](https://github.com/elastic/elastic-charts/actions/workflows/release.yaml) action is the last to be transitioned to buildkite in the coming weeks or so.

## Interactions

All interactions are performed on pull requests. Push events will always trigger on target branches and be cancelled if newer commits are pushed to the same branch.


### Skip a build

We can skip the buildkite build altogether either by applying the [`ci:skip`](https://github.com/elastic/elastic-charts/labels/ci%3Askip) label to the pull request or adding `[skip-ci]` string to the latest commit message (e.g. `docs: update readme [skip-ci]`). The commit can contain any of `[skip-ci]`, `[skip ci]`, `[ci skip]`, `[ci-skip]` to trigger a skip.

This will cancel any previous buildkite builds and apply a `skipped` status to all pull request check runs.

### Trigger build

Like jenkins we can use a special phrase `buildkite test this` as a PR comment and buildkite will start the build if the user has necessary permissions. A :+1: reaction will confirm this interaction was successfully processed.

> Note: this action will remove the `skip-ci` label if applied.

### Update VRT screenshots

We can now update the playwright screenshots in the CI by adding `[update-vrt]` string to the latest commit message (e.g. `chore: update vrt screenshots [update-vrt]`). The commit can contain any of `[update-vrt]`, `[vrt-update]`, `[update-screenshots]`, `[screenshots-update]` to trigger updating vrt screenshots.

We can also use a special phrase `buildkite update screenshots` or `buildkite update vrt` which will restart the current build with running the playwright tests in update mode.

This will run playwright in update mode and collate all new screenshots across the parallel `Playwright e2e` steps. Once all steps are completed, the new screenshots will be committed directly to the pull request.

> Note: Even running in update mode, the steps may fail due to timeouts or otherwise in such cases the check will still show as failed.

The commit that updates the screenshots is special in that the ci is skipped but since we already know the result of all jobs from the previous build run, we sync the statuses from the original commit to the latest commit. This is only done for this case, all other skipped commits will reported as skipped.
