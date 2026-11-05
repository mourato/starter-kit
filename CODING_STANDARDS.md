# Coding standards

Read during review (Standards axis) and retro. Extends the global standards at
`${AGENT_CONFIG_HOME:-$HOME/.agents}/core/standards/CODING_STANDARDS.md`;
project rules only.

## Review focus

- Failure here: a pattern every cloned project will copy: a silent failure,
  an unsafe default, or a data integrity gap in `data.db`.
- Skip: lockfiles.
- Needs a person: `apps/server/src/db/` (schema and migrations) and
  `setup.sh`.
