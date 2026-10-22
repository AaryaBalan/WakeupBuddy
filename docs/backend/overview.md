# ⚡ Convex Backend - Architecture & Development Philosophy

This document provides the foundational background for the WakeupBuddy serverless cloud backend powered by **Convex**.

---

## 1. Why Convex?
Traditional mobile backends require configuring relational databases (PostgreSQL/MySQL), provisioning REST/GraphQL API servers (Express/FastAPI), setting up WebSockets for real-time alerts, and managing complex cache invalidation.

Convex eliminates this stack:
1. **Unified Schema & Database**: Code and schema reside in the same codebase (`convex/schema.js`).
2. **Built-in Real-time Reactivity**: Every `query` automatically behaves like a WebSocket live subscription. When database state changes, the client updates reactively.
3. **ACID Transactions**: Every `mutation` executes within an atomic, consistent, isolated, and durable transaction. If any statement fails, the entire transaction rolls back.
4. **Serverless Cron Scheduling**: Built-in cron runtime (`crons.js`) executes background jobs without needing external Celery, BullMQ, or AWS Lambda setups.

---

## 2. Function Types in WakeupBuddy

| Type | Identifier | Public / Private | Behavior & Constraints |
| :--- | :--- | :--- | :--- |
| **Query** | `query({ args, handler })` | Public to Client | Pure read-only functions. Completely deterministic. Automatically cached and real-time reactive. Cannot mutate data. |
| **Mutation** | `mutation({ args, handler })` | Public to Client | Read-write transactional functions. Executes sequentially and commits atomically. |
| **Internal Query** | `internalQuery({ args, handler })` | Backend Only | Private read queries callable only by other backend functions or cron jobs. Not exposed to mobile clients. |
| **Internal Mutation** | `internalMutation({ args, handler })` | Backend Only | Private transactional mutations called only by cron workers or actions. |
| **Cron Job** | `cronJobs()` | Background Daemon | Automated recurring triggers (e.g., minute-by-minute stranger matching, midnight leaderboard reset). |

---

## 3. Directory Layout & Modules

The `convex/` directory contains:
- `schema.js`: Defines all 11 database tables, index definitions, and types.
- `crons.js`: Declares recurring timers and automated scheduled tasks.
- Domain-specific modules:
  - `users.js`: User accounts, bcrypt authentication, profile customization, reporting.
  - `alarms.js`: Alarm CRUD, toggle states, instant stranger pairing queries.
  - `matching.js`: Background stranger matchmaking engine.
  - `alarmDismissals.js`: Real-time alarm stop signaling between buddies.
  - `calls.js`: Call logs, duration recording, buddy call comparison analytics.
  - `streaks.js`: Daily wake-up logging, streak increments, 90-day heatmap queries.
  - `leaderboard.js`: Scoring calculations, daily/global ranking engines, midnight reset.
  - `achievements.js`: 17 achievement definitions, evaluation triggers, backfill routines.
  - `friends.js`: Social graph, friend requests, approval workflows.
  - `notifications.js`: In-app notification queues and buddy request syncing.
  - `appeals.js`: Ban appeal submission and review status.
