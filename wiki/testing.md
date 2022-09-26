## Timezone testing

Every jest test in this code runs in the local timezone.

### Run on every timezone

If you want to run a test suite on multiple timezone, just prepend a `tz` to the
standard `.test.ts` extension like:

```
formatters.tz.test.ts
scales.tz.test.ts
```

Your test will run in the standard local timezone and in all the configured timezones (UTC, America/New_York and Asia/Tokyo).
The local timezone tests results are included in the code coverage.

### Run on a specific timezone

If you are interested into explicitly create test for a timezone (we are now testing only on UTC, America/New_York and Asia/Tokyo) you have to prepend the `tz` but add one of the following postfix before the file extension: `utc`,`ny`,`jp`, for example

```sh
your_file_name.tz.test.utc.ts
your_file_name.tz.test.ny.ts
your_file_name.tz.test.jp.ts
```

Each test with the specific timezone postfix will be executed only on that timezone.

These tests are not included in the code coverage yet.


## Visual Regression Testing with Playwright

Every story created for Storybook is tested through our Visual Regression Testing suite. The tests are available in [`e2e/tests`](../e2e/tests/) directory and are grouped by example usages. The [`all.test.ts`](../e2e/tests/all.test.ts) file is unique to the other as it auto generates tests for all stories, to take a screenshot of each story and compare it to the existing baseline available at [`e2e/screenshots`](../e2e/screenshots/). You can add your own test, using Playwright to drive the page/chart interactions and capture screenshots.

To run the suite we first must generate files from the storybook details.

```
yarn test:e2e:generate
```

This command will generate the required code to be run on the server, extracting all the stories from Storybook and build a simple web app for the testing. You need to run this only the first time you need to run VRTs and only if you have added a new story to Storybook. You don't need to run it if you have just changed the existing stories.

Next we can start the `e2e_server` which is used as a simplified-storybook server to point our e2e tests at.

> You may want to debug issues with the `e2e_server` build that is causing screenshot failures not present in storybook. In such cases, this command can be used to debug any issues.

```
yarn test:e2e:server
```
The server is accessible at `http://localhost:9002`

In a separate terminal you can run the playwright tests against the `e2e_server`.

```
yarn test:e2e
```

This command will automatically start Playwright inside a docker container with chromium, controlled by Playwright, that runs the e2e tests and takes and compares screenshots.

If the screenshot differ from the baseline, a test error is raised and a diff images and files will be stored in [`e2e/test_failures/`](../e2e/test_failures/) grouped by test suite.

If a new test is added the test will fail and you must update screenshots, see below.

To update all existing screenshot baselines to the new version run:

```
yarn test:e2e -u
```

If a new test is added, a new screenshot `.png` file is written as part of the baseline.

> NOTE: Due to differences in architecture between local machines, even when running in docker, screenshots may produce slight diffs that are *irrelevant* to code changes. All local screenshots that are non-linux based (i.e. `-linux.png`) are `.gitignore`d. Please use this only for local testing and debugging and update screenshots from github, see below.


To run a specific test file run

```
# only runs tests from all.test.ts file
yarn test:e2e all.test.ts
```

To run the test on a specific story name or story group name use `--grep=<slugified test string>` see [docs](https://playwright.dev/docs/test-cli) for more filter options. This example will run the e2e test on `all.test.ts` file for all matching test name in `describe` or `test` with `<slugified test string>`.

```
yarn test:e2e all.test.ts --grep polarized-stacked
```

Updating screenshots from CI

The best way to update screenshots from the baseline is from GitHub directly. Is to post a comment on your pull request with the string `'buildkite update vrt'`.

<img width="1018" alt="image" src="https://user-images.githubusercontent.com/19007109/187287446-5ff2ddf7-e866-4bac-949b-f32a4fae64a9.png">

This will tell buildkite to run the playwright tests in _update mode_ and commit any updated screenshots **directly** to your pull request.

<img width="1013" alt="image" src="https://user-images.githubusercontent.com/19007109/187287604-0e896e6f-7c02-4adf-b7ad-ec0016d6340d.png">
