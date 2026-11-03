# alerts-remediator

A small LangGraph agent that watches a Synqly EDR integration for new alerts and triages each
one with two Claude Code agents, talking to Synqly only through the
[Synqly MCP server](../../services/mcp).

```
every POLL_SECONDS
  edr_query_alerts ──► new alert (status_id = 1, not seen before)
                           │
                           ▼
                 ┌───────────────────┐   list_account_integrations, then read-only tools against each one
                 │   investigate     │   (edr, identity, siem, vulnerabilities, appsec, assets, ...)
                 └───────────────────┘
                           │  { summary, verdict_id, disposition, remediation: [{tool, arguments, reason}],
                           │    residual_risk, recommendation }
                           ▼
                 ┌───────────────────┐   edr_update_alert + only the tools the investigator named
                 │    remediate      │
                 └───────────────────┘
                           │
                           ▼
         alert resolved (status 4 + verdict) or flagged for a human (status 2, Suspicious)
```

1. **Poll.** A plain LangChain MCP tool call to `edr_query_alerts`, with no LLM involved. It
   filters on `time gte <start of the previous successful poll>`, so each poll asks only for
   alerts since the last one. The first poll looks back one `POLL_SECONDS` interval. A failed poll
   doesn't advance the window, so the next one covers it. Alerts still in status `New` that
   haven't been seen yet are handed to the graph one at a time.
2. **Investigate.** A Claude Code agent (via the
   [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview)) gathers evidence with
   read-only Synqly tools. It lists the account's integrations, starts from the EDR the alert
   came from, and corroborates with every other integration that could hold evidence (see
   [Evidence sources](#evidence-sources)). It returns structured JSON: a summary, an OCSF
   `verdict_id`, a disposition (`resolve` or `escalate`), any Synqly MCP operations it
   recommends for remediation, such as `edr_network_quarantine`, `edr_create_iocs` or
   `identity_disable_user`, and, as separate strings, the `residual_risk` left once those run
   and a `recommendation` for what a human should do next.
3. **Remediate.** A second Claude Code agent runs those operations, then calls `edr_update_alert`:
   - **Resolve**, when the disposition is `resolve` and everything succeeded: `status_id=4` with
     the investigator's verdict, plus a comment covering the findings, the actions taken, the
     residual risk and the recommendation.
   - **Flag for a human**, otherwise: `status_id=2` (InProgress) with `verdict_id=4`
     (Suspicious), plus a comment saying what needs a person.

## Prerequisites

- [uv](https://docs.astral.sh/uv/)
- A running Synqly MCP server that has the `edr_update_alert` tool, which `services/mcp`
  provides. `DRY_RUN=1` doesn't call it, so any Synqly MCP server works for a dry run. Either:
  - `make mcp-stack` from the repo root. This runs an embedded platform plus MCP at
    `http://localhost:18000/mcp`, and its well-known token is in `compose-mcp.yaml`.
  - `cd services/mcp && uv run synqly-mcp-server`, which serves `http://localhost:8000/mcp`
    against `api.synqly.com`.
- A Synqly organization token, and an account with an EDR integration whose provider supports
  `update_alert` (CrowdStrike, Microsoft Defender, SentinelOne and Bitdefender at the time of
  writing; the MCP `get_provider_details` tool has the current list).
- Optionally, more integrations on the same account, in any category and any number per
  category, for the investigator to draw on. See
  [Evidence sources](#evidence-sources).
- Claude Code authentication for the Agent SDK. Either be logged in to Claude Code (`claude`
  then `/login`) or set `ANTHROPIC_API_KEY`.

## Run

```bash
cd examples/alerts-remediator
export SYNQLY_ORG_TOKEN=<org token>
DRY_RUN=1 uv run main.py                           # investigate only: no remediation, no alert updates
uv run main.py
```

`uv run` creates the virtualenv and installs the dependencies from `uv.lock` on first use.

| Variable                 | Default                      | Meaning                                                                                  |
| ------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------- |
| `SYNQLY_ORG_TOKEN`       | required                     | Synqly org token, sent to the MCP server as `Authorization: Bearer`                      |
| `SYNQLY_MCP_URL`         | `https://mcp.synqly.com/mcp` | Synqly MCP server endpoint                                                               |
| `SYNQLY_ACCOUNT`         | auto-select                  | Account to use, needed when the org has more than one                                    |
| `SYNQLY_EDR_INTEGRATION` | auto-select                  | EDR integration to poll and update alerts in, needed when the account has more than one  |
| `POLL_SECONDS`           | `60`                         | Interval between `edr_query_alerts` polls                                                |
| `DRY_RUN`                | off                          | Investigate only; print the planned remediation without running it or updating the alert |

Stop it with Ctrl-C.

## Evidence sources

The investigator starts by calling `list_account_integrations`, then queries each integration
that could hold evidence, passing its id as `integration_name`. It isn't limited to one
integration per category: with two SIEMs or three vulnerability scanners, it queries them all.
`SYNQLY_EDR_INTEGRATION` only picks which EDR the poll reads alerts from.

The `SOURCES` variable lists the categories, what the prompt tells the investigator to look
for in each, and the read-only tools it may call. For the purposes of this demo, we explicitly
list them in the `SOURCES`; however, we could build this list dynamically from the capabilities
tool.

`list_account_integrations`, `get_provider_details` and `get_provider_filters` are always
available. Edit `SOURCES` to add or drop a source.

## How the agents are fenced in

Each agent runs with no built-in Claude Code tools (`tools=[]`), so it has no shell or file
access. It also runs with `permission_mode="dontAsk"`, so any tool outside its allow-list is
denied without a prompt.

- The investigator may call only the read-only tools in `INVESTIGATOR_TOOLS`: those in
  `SOURCES`, plus `list_account_integrations`, `get_provider_details` and `get_provider_filters`.
- The remediator may call only `edr_update_alert` and the specific tools the investigator put
  in its `remediation` list.

Both prompts tell the agent to treat alert contents and tool results as data, not instructions.
Alerts are still attacker-influenced input, and so are the emails, tickets and SIEM events the
investigator reads. All of it feeds an agent that can take containment actions. Run with
`DRY_RUN=1` until you trust the output for your environment. A dry run never starts the
remediator, so it makes no writes to Synqly.

## Limitations

These are deliberate, to keep the example short:

- **The poll window lives in memory.** After a restart, polling looks back only one interval, so
  alerts raised while it was down are never picked up. An alert whose triage failed is not
  retried, so one bad alert can't loop and burn tokens.
- **Late-arriving alerts can be missed.** The filter is on the alert's OCSF `time`. If a provider
  surfaces an alert in its API after a poll window that already covered its `time`, that alert
  is skipped. Subtract a few minutes from `since` if your provider indexes slowly; the `seen` set
  absorbs the duplicates.
- **One page per poll.** Only the first 50 alerts are fetched, with no pagination, and alerts
  are triaged one at a time.
- **No human approval step.** The remediator runs the suggested operations directly. Add one
  in `remediate` if you need it.
