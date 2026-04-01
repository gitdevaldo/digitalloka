# Lessons

- Date: 2026-04-01
- Mistake: Failed to consistently follow instruction-file behavior after loading it; introduced avoidable confusion by creating/renaming extra instruction files.
- Rule: Treat `.github/copilot-instructions.md` as canonical and keep changes tightly scoped to the exact user request.
- Rule: On every user correction, immediately record the lesson and apply it in the next action.

- Date: 2026-04-01
- Mistake: Missed the mandatory post-edit workflow chain after making file changes.
- Rule: Always execute the full chain after edits: verification, changelog update, git status/diff check, explicit staging, conventional commit, then immediate push.
- Enforcement: If any step is skipped, stop and complete it before continuing.
