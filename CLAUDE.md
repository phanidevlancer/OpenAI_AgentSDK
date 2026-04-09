# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run any example file
node index.js
node tool_agent.js
node agent_manager.js
node agent_handoff.js
node input_guardrail.js
node output_guardrails.js

# Run with auto-reload on file changes
npm run dev  # runs: node --watch index.js
```

No build step, linter, or test runner is configured. Each `.js` file is a standalone runnable example.

## Environment

Requires `OPENAI_API_KEY` in a `.env` file. The `dotenv/config` import at the top of each file loads it automatically.

## Architecture

This is a learning/exploration repo for the `@openai/agents` SDK. Each file is a self-contained example demonstrating a specific agent pattern:

| File | Pattern |
|------|---------|
| `index.js` | Basic agent with dynamic instructions (function returning string based on runtime state) |
| `tool_agent.js` | Agent with tools + structured output — uses `zod` schemas for both tool parameters and `outputType` |
| `agent_manager.js` | Multi-agent: a `salesAgent` exposes a `refundAgent` as a tool via `.asTool()` |
| `agent_handoff.js` | Agent handoff: a `customerFacingAgent` uses `handoffs: [...]` to route to specialist agents; uses `RECOMMENDED_PROMPT_PREFIX` from `@openai/agents-core/extensions` |
| `input_guardrail.js` | Input guardrail: a classifier agent runs before the main agent; throws `InputGuardrailTripwireTriggered` when `tripwireTriggered: true` |
| `output_guardrails.js` | Output guardrail: a validator agent inspects the main agent's output; throws `OutputGuardrailTripwireTriggered` when unsafe |

### Key SDK concepts used

- **`Agent`** — created with `name`, `instructions` (string or function), optional `tools`, `outputType`, `inputGuardrails`, `outputGuardrails`, `handoffs`
- **`tool()`** — defines a tool with `name`, `description`, `parameters` (zod schema), and `execute` function
- **`run(agent, input)`** — executes an agent; returns object with `finalOutput`
- **`agent.asTool()`** — wraps an agent as a tool callable by another agent (multi-agent as tool pattern)
- **`handoffs`** — array of agents the orchestrator can delegate to (true handoff pattern)
- **Guardrails** — objects with `{ name, execute }` where `execute` returns `{ tripwireTriggered: boolean }`
- **Structured output** — pass a zod schema to `outputType`; `result.finalOutput` is typed accordingly
