# Next steps

## deployment action
- [x] Build storybook
- [x] Build e2e server under /e2e
- [x] deploy both
- [x] handle concurrent jobs
- [x] handles status when cancelled
- [x] handles approval and rejection process
  - This is moreso about linking an environment in a workflow than the deployment itself.
  - The deployment event is not tied to the approval of the workflow.
- [] Check if using the base ref trick for deploy creates issues.

- Does name order matter for string value interpolation? NO

## pr-deploy_trigger/push action
- [x] See if splitting with a reusable workflow is a good idea
- [x] add control flow for non-pr, non-master changes
- [x] Need to add reviewer to enable deployment when not a pr and not master.
- [x] Must not be an orphan ref
- [x] This will deploy to firebase under the branch name channel

## playwright action
- [] trigger workflow on successful deployment_status
- [] Create new action to handle running playwrite after deployment
- [] Check to make sure the deployment was triggered by a pr first
- [] Send status update with completed runs and errors

## Other tasks
- [] Test failure cases
- [] Test closing a pr
- [] Test re/opening a pr
- [] Test above 3 points with different user (nickoftime)
- [] Cleanup and annotate action yml files, add spacers ######
- [] Rebase and cleanup commits on new branch
- [] Refactor master checks to run after deployed to gh-pages
- [] Check enviroment cleanup when pr is closed.

## Optional stuff
- [] Build in GCP storage of diff files

---

Finally write a blog post for DEV.co
