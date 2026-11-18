# Screenshot update trigger

Approvers authorize Buildkite visual-regression screenshot updates on pull requests by commenting.

## Language

**Approver**:
A member of the elastic GitHub organization who may write an Approval comment. If membership cannot be determined, the commenter is not an Approver and the build is refused.
_Avoid_: maintainer, collaborator, CODEOWNER, write access

**Trusted author**:
The GitHub user who opened the pull request, when that user is a member of the elastic GitHub organization. If membership cannot be determined, the opener is not a Trusted author and the build is refused. A definite non-member is not a Trusted author; the Approval comment must then name a SHA.
_Avoid_: collaborator, commit author, head repository, someone who pushed, someone on the PR

**Approved commit**:
The commit an Approval comment authorizes for a screenshot-update build. If the comment names a SHA, that SHA is the Approved commit: it must be the pull request's head, and that head must already have been in place when the comment was written. If the comment names no SHA, the pull request must have a Trusted author, and the Approved commit is the pull request's head when the comment is processed.
_Avoid_: the PR, HEAD, latest SHA, current head

**Approval comment**:
A pull-request comment, written by an Approver, that authorizes one Approved commit. It contains `buildkite update screenshots` or `buildkite update vrt`, optionally followed immediately by a commit SHA. The SHA is required unless the pull request has a Trusted author. Success is acknowledged only after the screenshot-update build has been requested; a refused pin is acknowledged the same way as a non-Approver.
_Avoid_: trigger, command
