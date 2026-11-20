# WEALTH OS — Project Documentation

**Project:** WEALTH OS  
**Product:** Private Personal Investment & Wealth Tracker  
**Status:** Approved product direction; implementation-ready specification  
**Audience:** Gemini Antigravity (primary implementation agent), product owner, reviewer  
**Initial market:** Indonesia  
**Default reporting currency:** IDR  
**Product mode:** Private, single-user first; no public registration or social features

## Documentation map

| File | Purpose |
|---|---|
| `docs/PRD.md` | Product requirements, scope, workflows, business rules, acceptance criteria |
| `docs/DESIGN.md` | Visual direction, information architecture, screens, interaction and responsive behavior |
| `docs/TECHNICAL_ARCHITECTURE.md` | Proposed stack, architecture, security, integrations, deployment |
| `docs/DATA_MODEL.md` | Entities, relationships, transaction semantics, calculations and invariants |
| `docs/MILESTONE_PLAN.md` | Detailed staged delivery plan with dependencies, tasks, tests and exit gates |
| `docs/ANTIGRAVITY_AGENT_GUIDE.md` | Operating instructions for Gemini Antigravity |
| `docs/DECISIONS_AND_OPEN_ITEMS.md` | Locked decisions, assumptions and items deliberately deferred |

## How to use this package

1. Read `PRD.md`, `DECISIONS_AND_OPEN_ITEMS.md`, and `ANTIGRAVITY_AGENT_GUIDE.md` first.
2. Inspect the existing `design-reference/` directory before implementing visual components. Treat its contents as visual references, not as permission to copy unrelated product behavior.
3. Implement one milestone at a time. Do not jump ahead or silently expand scope.
4. Before each milestone, create/update a short implementation plan and identify files likely to change.
5. After each milestone, run the defined tests, update documentation, and report what is complete, what is not, and any blockers.
6. Do not use mock data as if it were the user's real financial data. Seed/demo data must be clearly labeled and removable.

## Product principle

WEALTH OS is a personal record and analysis system. It records what the user owns, what they bought/sold, income actually received, cash balances, and outstanding liabilities. It does **not** execute trades, transfer money, provide custody, or act as an accounting system.

## Important scope guardrails

- No physical/personal assets in the initial product: property, vehicles, laptop, phone, furniture, collectibles, etc.
- No daily expense tracker, household budget, bill payment, bank payment initiation, broker order placement, tax engine, fee engine, or accounting ledger.
- No storing bank/broker passwords, PINs, OTPs, API secrets belonging to the user's broker account, or payment credentials.
- Market data refresh is user-triggered (manual refresh action); do not schedule automatic polling in the initial release.
- The app must remain useful when external market-data APIs are unavailable.
