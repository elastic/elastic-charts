# Elastic Datavis Bot

A GitHub App for automating tasks in datavis repos including:

- elastic-charts repo.

# Code Structure

The code is split into two main sections as listed below, excluding shared `utils/` directory.

## GitHub tasks

API route: `/github`

This sections uses [Probot](https://github.com/probot/probot) to easily handle webhooks for any github event. These events are organized into their own directory grouping under [`github_bot/src/github/events/`](https://github.com/elastic/elastic-charts/tree/main/github_bot/src/github/events).

This currently handles:

- Buildkite build triggers for `pull_request`, `push` and `issues_comment` events. Includes enforcement of user permissions and custom label/commit actions.

Future handlers:

- [ ] Project beta automation
- [ ] More granular commands from issue/pr comments

## Buildkite tasks

API route: `/buildkite`

This handles buildkite job cancellations. Currently buildkite does not have an easy way to handle builds when a build is manually cancelled, particularly with updating GitHub checks.


# Contributing

There is some setup for developing this locally. For more, check out the [Contributing Guide](CONTRIBUTING.md).

# Inspiration

This app and setup was inspired by [`elastic/buildkite-pr-bot`](https://github.com/elastic/buildkite-pr-bot).

# Todos

- [ ] Closing PRs should cleanup deployment and environment
- [ ] Closing PRs should cancel buildkite build
- [ ] Auto release every PR, skip based on PR label
- [ ] Check PR for any previous approvals to use as user check
- [ ] Run step skip logic from cloud fn instead of buildkite pipeline
- [ ] Check `./buildkite` directory for changes
- [ ] Read options from config file (i.e. skip label, user check options, etc).
- [ ] Parallel steps don't know about each other so retries of steps won't report status
- [ ] Run jobs individually, especially being able to run update vrt on it's own to avoid running all jobs again.
- [ ] Handle single job retries from buildkite, this may require our own agent to avoid too much pain.
