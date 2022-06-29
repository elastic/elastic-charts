# Elastic Datavis Buildkite config

Buildkite config for automating CI in datavis repos including:

- elastic-charts repo.

including events for:

- `pull_request`
- `push`

# Code Structure

The code is split into `pipelines`, `scripts`, `steps` and `utils` directories.

## `steps/`

Defines all steps to be used inside `pipelines/`.

## `scripts/`

Defines all typescript scripts to be used throughout `.buildkite/`. The `scripts/steps/` directory is a special directory to store scripts to be used as `commands` in the defined steps.

## `utils/`

Shared scripts to be used throughout `.buildkite/`. Includes buildkite and GitHub clients to be used to make API requests.

# Todos

- [ ] Improve buildkite environment lookup
- [ ] Report annotations for failed steps
- [ ] Report check summary output for steps
- [ ] Improve yarn install, better isolation of required dependencies
- [ ] Improve node module caching
- [ ] Improve agent run time with our own agents
- [ ] Improve skip logic to build a running state of previously successful runs based on files changed since then
