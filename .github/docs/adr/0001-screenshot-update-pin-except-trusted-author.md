# Screenshot-update comments pin a SHA except for Trusted authors

An Approval comment authorizes one Approved commit, not whatever head exists when the workflow later reads the pull request. We require the comment to name that commit, and it must already have been on the pull request when the comment was written — except when the opener is a Trusted author (elastic org member), who may omit the SHA.

Trusted authors can already run this pipeline unattended, so always demanding a SHA only adds friction on internal PRs. We accepted that the skip is a weaker pin among org members, in exchange for keeping the existing comment for those pull requests.

## Considered Options

- **Always require a named SHA** — strongest pin, worse UX on internal PRs.
- **Never require a SHA; refuse only if the head moved after the comment** — keeps UX but depends on proving push time for every run.
- **Named SHA for everyone except Trusted authors** (this decision) — pin untrusted PRs; skip both checks when the opener is already trusted.
