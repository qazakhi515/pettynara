# Reusable Prompts — Burak → Pettynara Migration

A library of prompts: the most useful ones from this session, plus reusable templates for the next session. Designed to be **safe** (plan-first, no destructive defaults).

---

## Most useful prompts from this session

```text
Analyze the current Burak repo structure to plan transforming this Node.js
backend into the Pettynara pet-shop platform. Do not change code yet.
```

```text
Safe rename layer (no business logic change): rename all visible "Burak"
identifiers to "Pettynara". Do not change domain logic. Keep API routes and
database collections unchanged. Update package name, env labels, and constants.
Run lint and typecheck after. Make a plan first.
```

```text
Generate a docs/ folder summarizing the Burak → Pettynara migration state:
BACKEND_MIGRATION, DECISIONS, FRONTEND_MIGRATION, COMPLETED_TASKS, NEXT_STEPS,
PROMPTS. Documentation only — do not change source code.
```

---

## 1. Repo inspection

```text
Inspect this repo read-only. List the architecture: entry points, routers,
controllers, services, schemas, enums, views, and assets. Identify every place
the old brand/domain name appears. Report findings with file:line. Do not edit.
```

```text
List all REST endpoints (method + path + handler) and all Mongoose model/
collection names. Flag anything that must NOT change during migration.
```

## 2. Backend migration

```text
Plan first. Migrate the backend domain from <OLD> to <NEW> in safe layers.
Layer 1: branding only. Layer 2: domain (roles, enums). Keep API + collections
stable. After each layer run `npx tsc --noEmit` and a residual-name grep.
```

```text
Rename <OLD_ENUM_VALUE> to <NEW_ENUM_VALUE> across enum, type, schema, controller,
service, and EJS. Provide an updateMany backfill for existing documents. Keep the
old API value working as an alias. Typecheck after. Plan first.
```

## 3. Frontend migration

```text
Inspect the React frontend repo. Map its pages/components/routes/API client to
docs/FRONTEND_MIGRATION.md. Flag mismatches with the assumed structure. Read-only.
```

```text
Apply the branding + terminology pass from docs/FRONTEND_MIGRATION.md (name, logo,
favicon, colors, copy; <OLD_TERMS>→<NEW_TERMS>). Do not change API request values.
```

## 4. API mapping

```text
Produce a request/response field map for the migration. For each endpoint list
fields whose enum values change (e.g. memberType, productCollection), old vs new
values, and the frontend action needed. Output as a markdown table.
```

```text
Add an additive alias endpoint <NEW_PATH> that reuses the <OLD_PATH> handler so the
frontend can migrate without a breaking change. Keep <OLD_PATH> deprecated. Plan first.
```

## 5. Branding replacement

```text
Find every occurrence of "<OLD_BRAND>" (case-insensitive) across all files except
node_modules and .git. Classify each (package name / UI text / comment / env /
generated). Replace only genuine brand tokens; regenerate lock and build artifacts
rather than hand-editing them. Verify with a full-tree grep returning zero matches.
```

## 6. Testing

```text
Set up a minimal test runner (Jest + supertest) and write smoke tests for the core
endpoints (login, product list, order create). Add a real `npm test` script. Report
pass/fail output.
```

```text
Add ESLint (typescript-eslint) + Prettier with config and a lint script. There is
currently no linter. Keep formatting changes in a separate commit from logic.
```

## 7. Final QA

```text
Run full verification: `npx tsc --noEmit`, `npm run build`, lint (if configured),
and a residual-name grep. Start the server and hit the core endpoints. Report a
checklist of pass/fail and anything not validated. Do not change code to "fix"
failures without asking.
```

```text
Diff-review the migration branch: confirm no API route or collection name changed
unintentionally, no domain values were renamed without a data migration, and the
docs/ files match the actual repo state. Summarize risks before merge.
```

---

## Conventions baked into these prompts
- **Plan first** for anything touching source.
- **Typecheck + grep** after every change (no linter/tests exist yet — see NEXT_STEPS N11/N12).
- **Additive/aliased** API changes over breaking renames.
- **Enum value renames imply data migrations** — always pair with a backfill.
- Project is **Burak → Pettynara** (not Nestar → Petoria).
