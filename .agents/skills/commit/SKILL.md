---
name: commit
description: Commit the working tree as logical, well-described commits. Use when the user asks to commit, "commit these changes", or to group changes into commits. Splits unrelated changes into separate commits, even within one file, and writes Conventional Commits messages.
---

# Commit

Turn the uncommitted changes into a clean series of commits. Each commit is one logical change that builds on its own and can be reverted alone.

## 1. Inspect

Run `git status --short`, `git diff` (and `git diff --cached` if anything is staged), and `git log --format='%s' -15`. Read the whole diff before deciding anything. Match the scopes and style of the recent log.

Do not commit secrets, `.env*` files or local credentials. Do not commit unrelated stray files; ask if unsure.

## 2. Group

Decide the commits before staging. Group by purpose, not by file:

- One purpose per commit: a feature, a fix, a refactor, docs, a chore. A fix found while building a feature is its own `fix` commit.
- A file can belong to more than one commit. Split it by hunk.
- Keep a change together with what it needs: the design-log entry for a design decision goes with the code that made it (see `AGENTS.md`), tests go with the code they test, token docs go with token changes.
- Order commits so each one leaves the project working: refactors and fixes before the features that rely on them.
- Pure formatting or renames go in their own commit, never mixed with behavior changes.

## 3. Stage precisely

Stage by file with `git add <paths>`. To split a file, use hunks. `git add -p` is interactive, so feed it answers on stdin, one per hunk in the order shown (`y` stage, `n` skip, `s` split further):

```bash
printf 'n\ny\n' | git add -p path/to/file
```

Always run `git diff --cached --stat` (and `git diff --cached` for split files) before committing to confirm only the intended changes are staged. Never use `git add -A` or `git add .` when changes belong to more than one commit.

## 4. Write the message

Format:

```
<type>(<scope>): <summary>

<body>

Co-Authored-By: ...
```

**Subject**
- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `build`, `ci`, `chore`.
- Scope is the area touched (`nav`, `home`, `agents`, `docs`, `design`). Use scopes already in the log.
- Imperative mood ("add", "fix", "center"), lower case, no trailing period.
- 50 characters is the target, 72 the hard limit.
- Say what the change does, not how it was found or which file it touched.

**Body** (skip it only for trivial changes)
- Blank line after the subject. Wrap at 72 columns.
- Explain why: the problem, the cause, and the effect of the change. The diff already shows what.
- For a fix, state the symptom and the root cause.
- Mention a decision recorded elsewhere (design log, ADR) in one line.

**Footer**
- `BREAKING CHANGE: <description>` when applicable, and `Closes #N` / `Refs #N` for issues.
- End with the attribution line given in the session's system reminder, if there is one.

Pass the message with a heredoc (`git commit -F - <<'E'`) so formatting survives.

## 5. Verify and report

After the last commit run `git log --stat -n <count> --format='%h %s'` and `git status --short`. The tree should be clean unless the user wanted something left out.

Report the commits as a short list of hash and subject. If you split a file or left something uncommitted, say so.

## Rules

- Commit only when the user asks. Never push, amend, rebase or force anything unless told to.
- If on the main branch, create a branch first, as the session's git rules require.
- If a hook fails, fix the cause and make a new commit. Do not skip hooks with `--no-verify`.
- If the grouping is genuinely ambiguous (for example two ways to split that the user may care about), ask once. Otherwise pick the finer split.
