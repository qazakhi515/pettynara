# Architectural Decisions — Burak → Pettynara Migration

Each decision lists **rationale**, **risks/tradeoffs**, and **alternatives considered**. Grouped by area.

> Status: ✅ decided & applied · 🟡 decided, not yet applied · 💬 discussed

---

## Backend

### B1 ✅ Migrate in safe layers (brand first, domain later)
- **Decision:** Split the migration into an isolated cosmetic **brand-rename layer** (Burak→Pettynara) executed first, with the **domain rename** (RESTAURANT→STORE, food→pet categories) deferred to a later pass.
- **Why:** The brand rename has zero behavioral risk and can be verified instantly (typecheck + grep). Bundling it with domain logic changes would make regressions hard to isolate.
- **Risks/tradeoffs:** Repo is temporarily in a mixed state — branded "Pettynara" but still using `restaurant`/food domain terms internally. Could confuse a reader who assumes full migration.
- **Alternatives:** One big-bang migration (rejected: high risk, hard to review); domain-first (rejected: more invasive, branding is the cheap quick win).

### B2 🟡 Seller role `RESTAURANT` → `STORE`
- **Decision:** Rename `MemberType.RESTAURANT` to `MemberType.STORE` (user-selected over `SHOP`).
- **Why:** "Store" is the natural pet-shop seller noun; concise and neutral.
- **Risks/tradeoffs:** Cross-cutting — touches enum, controller name, service methods, route handler, EJS hidden field, and **stored DB values**. Requires a data backfill for existing members.
- **Alternatives:** `SHOP` (also offered); keep `RESTAURANT` and only rebrand UI (rejected: leaves misleading domain code).

### B3 ✅ Leave domain symbols untouched during brand rename
- **Decision:** The brand-rename layer did **not** change `restaurant*` identifiers, routes, or collections.
- **Why:** They are domain logic, not the "Burak" brand; scope discipline keeps the rename safe and reviewable.
- **Risks/tradeoffs:** Two-step process; `restaurant` terms linger until the domain pass.
- **Alternatives:** Rename everything at once (rejected — see B1).

### B4 💬 Fix latent `productmages` typo during domain pass
- **Decision:** Defer fixing the misspelled schema field `productmages` ([Product.model.ts](../src/schema/Product.model.ts) L55) until the domain/schema pass.
- **Why:** It's a schema field rename = data migration; better batched with the other schema changes.
- **Risks/tradeoffs:** Until fixed, `productImages` from the type never persists/loads correctly. Possibly already a live bug.
- **Alternatives:** Hotfix now (reasonable, but out of the brand-rename scope that was authorized).

---

## Frontend

### F1 💬 Treat frontend migration as a forward plan (repo not present)
- **Decision:** Document the React migration as a plan; component mappings are assumption-based and flagged for verification.
- **Why:** The React app is a separate repo not in this workspace; we can only anchor to the known API contract.
- **Risks/tradeoffs:** Mappings may not match the real component tree.
- **Alternatives:** Skip frontend docs (rejected: user explicitly wants the plan).

### F2 🟡 Keep API contract stable to decouple frontend rollout
- **Decision:** Prefer additive/aliased endpoints and a value-mapping shim over breaking renames, so frontend and backend can deploy independently.
- **Why:** Avoids a forced lockstep release.
- **Risks/tradeoffs:** Temporary dual vocabulary (`restaurant` + `store`) to maintain and later clean up.
- **Alternatives:** Hard rename + coordinated deploy (rejected: fragile).

---

## Database

### D1 ✅ Rename DB `Burak` → `Pettynara` (user override)
- **Decision:** Change the database name in [.env](../.env) `MONGO_URL`.
- **Why:** User wanted a full rebrand including the datastore name.
- **Risks/tradeoffs:** ⚠️ App now points at an **empty** `Pettynara` DB; existing Burak data won't appear without a `mongodump`/`mongorestore` migration. The assistant's recommendation was to keep `/Burak`; user overrode.
- **Alternatives:** Keep `/Burak` (recommended, rejected by user); migrate data into new DB (pending — see NEXT_STEPS).

### D2 ✅ Keep collection names unchanged
- **Decision:** `products/members/orders/orderitems/views` stay as-is.
- **Why:** Renaming collections would orphan all existing data with no functional benefit.
- **Risks/tradeoffs:** None material.
- **Alternatives:** Pluralize/rebrand collections (rejected: pointless data risk).

### D3 🟡 Enum-value renames are data migrations
- **Decision:** Treat `RESTAURANT→STORE` and category value renames as requiring an `updateMany` backfill (or read-time mapping).
- **Why:** Stored documents hold the old string values; code-only renames would mismatch persisted data.
- **Risks/tradeoffs:** Migration script must run against the correct (and now possibly empty) DB.
- **Alternatives:** Read-time compatibility mapping without rewriting data (viable interim).

---

## API

### A1 ✅ No endpoint changes in the rename layer
- **Decision:** All routes in [router.ts](../src/router.ts) / [router-admin.ts](../src/router-admin.ts) unchanged.
- **Why:** Protect the live frontend contract; the rename is cosmetic.
- **Risks/tradeoffs:** Path `/member/restaurant` still carries old vocabulary.
- **Alternatives:** Rename routes now (rejected: breaks frontend).

### A2 🟡 Introduce `/member/store` as additive alias (future)
- **Decision:** When domain rename lands, add `/member/store` while keeping `/member/restaurant` deprecated.
- **Why:** Backward compatibility during frontend transition.
- **Risks/tradeoffs:** Two endpoints to maintain temporarily.
- **Alternatives:** Replace path outright (rejected: breaking).

---

## Branding

### BR1 ✅ Limit brand rename to genuine "Burak" tokens
- **Decision:** Replace only the 4 real brand occurrences (package name/description, app comment, EJS title, DB name); regenerate `package-lock.json` and `dist/` rather than hand-editing them.
- **Why:** Minimal, reviewable diff; lock/build are generated artifacts.
- **Risks/tradeoffs:** None; verified by full-tree grep returning zero "burak".
- **Alternatives:** Hand-edit lock/dist too (rejected: redundant, regenerated anyway).

### BR2 ✅ Pet categories = `FOOD/TOY/ACCESSORY/GROOMING/HEALTH`
- **Decision:** Chosen pet-shop `ProductCollection` taxonomy (user-selected).
- **Why:** Covers the core pet-retail catalog cleanly.
- **Risks/tradeoffs:** No generic `OTHER` bucket; uncategorizable items need a home (an `OTHER` could be re-added).
- **Alternatives:** `FOOD/TOY/ACCESSORY/HEALTH/OTHER` (offered); keep food enums + rebrand UI only (rejected).

### BR3 ⚠️ No code linter exists
- **Decision:** Note that there is no ESLint/Prettier setup (`.hintrc` is webhint, not a TS linter); "lint" steps are N/A until one is added.
- **Why:** Transparency — "run lint" can't be honored as-is.
- **Risks/tradeoffs:** No automated style/quality gate; relies on `tsc` typecheck only.
- **Alternatives:** Add ESLint (recommended future task — see NEXT_STEPS).
