# Lessons

- Date: 2026-04-01
- Mistake: Read instruction markdown files but did not consistently execute their behavior rules, causing unnecessary file churn and conflicting instruction sources.
- Rule: After reading workspace instruction files, execute them strictly: keep one canonical instruction file, avoid extra scope, and perform only the user-requested change path.
- Enforcement: Before edits, restate the exact requested delta in one line and apply only that delta unless user asks for expansion.
