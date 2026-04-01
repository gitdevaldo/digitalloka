# Lessons

- Date: 2026-04-01
- Mistake: Read instruction markdown files but did not consistently execute their behavior rules, causing unnecessary file churn and conflicting instruction sources.
- Rule: After reading workspace instruction files, execute them strictly: keep one canonical instruction file, avoid extra scope, and perform only the user-requested change path.
- Enforcement: Before edits, restate the exact requested delta in one line and apply only that delta unless user asks for expansion.

- Date: 2026-04-01
- Mistake: After making edits, I did not immediately follow the required post-edit chain (verification, changelog update, git status/diff review, explicit staging, commit, and push).
- Rule: Every edit session must end with the required chain in order: verify -> update `docs/log/log-changes.md` -> `git status` + `git diff` -> explicit `git add` -> conventional `git commit` -> `git push`.
- Enforcement: Do not send completion unless the chain is finished or a concrete blocker is reported.
