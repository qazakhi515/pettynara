# Next Steps — Prioritized

Ordered by priority. 🔴 blocker · 🟠 high · 🟡 medium · 🟢 low. Each task includes a **safe next prompt** to run.

---

## 🔴 Blockers (do first)

### N1 — Verify runtime boot against the new `Pettynara` DB
The DB name was changed but the server was never started against it.
- **Prompt:** `Start the backend (npm run start:dev) and confirm it connects to the Pettynara database and serves /product/all without errors. Report the console output. Do not change code.`

### N2 — Decide & execute data migration (Burak DB → Pettynara DB)
The new DB is empty; existing data lives in the old `Burak` database.
- **Prompt:** `Outline a safe mongodump/mongorestore plan to copy collections from the Burak database to the Pettynara database. Provide exact commands. Do not run anything destructive.`

---

## Backend cleanup

### N3 🟠 — Execute the domain rename: RESTAURANT → STORE
- **Prompt:** `Plan first. Rename MemberType.RESTAURANT to STORE and restaurantController to storeController, including service methods (getRestaurant→getStore), the verifyRestaurant guard, and the EJS hidden memberType value. Keep the /member/restaurant route working as an additive alias /member/store. Run typecheck after.`

### N4 🟠 — Migrate ProductCollection enum to pet categories
- **Prompt:** `Plan first. Change ProductCollection from DISH/SALAD/DESSERT/DRINK/OTHER to FOOD/TOY/ACCESSORY/GROOMING/HEALTH across enum, type, schema, and EJS, plus an updateMany backfill script for existing product documents. Run typecheck after.`

### N5 🟡 — Resolve ProductVolume / ProductSize for pet domain
- **Prompt:** `Plan first. Decide whether to convert ProductVolume (drink liters) to weight/kg or remove it, and adjust ProductSize for pet products. Update enum, type, schema, and EJS form. Run typecheck.`

### N6 🟡 — Fix the `productmages` schema typo
- **Prompt:** `Fix the misspelled field productmages → productImages in src/schema/Product.model.ts and align it with the Product type, including a migration to rename the field in existing documents. Run typecheck.`

### N7 🟢 — Clean remaining "Restaurant" copy in EJS
- **Prompt:** `Replace user-visible "Restaurant"/"RESTAURANT MENU" labels in src/views/*.ejs with Store/Pettynara copy. Do not change the memberType value or route logic yet.`

---

## Frontend migration

### N8 🟠 — Inventory the React frontend repo
- **Prompt:** `Inspect the Burak React frontend repo. List pages, components, routes, the API client, and theme/asset files. Map them to the Pettynara plan in docs/FRONTEND_MIGRATION.md and flag any mismatches.`

### N9 🟡 — Frontend branding + terminology pass
- **Prompt:** `Apply the branding and UI-terminology changes from docs/FRONTEND_MIGRATION.md (name, logo, favicon, colors, copy; Restaurant→Store, Menu→Catalog). Do not change API call values yet.`

### N10 🟡 — Add API-client compatibility shim
- **Prompt:** `Add a central mapping in the React API client for memberType and productCollection values so the UI can show pet vocabulary while the backend still returns old enum values.`

---

## Testing

### N11 🟠 — Establish a test baseline
- **Prompt:** `Set up a minimal test runner (e.g. Jest + supertest) and write smoke tests for /member/login, /product/all, and /order/create. Add a real npm test script.`

### N12 🟡 — Add ESLint + Prettier
- **Prompt:** `Add ESLint (typescript-eslint) and Prettier with sensible config and a lint script, since no linter currently exists. Do not auto-fix source beyond formatting in a separate commit.`

---

## Database

### N13 🟠 — Write enum backfill migrations
- **Prompt:** `Write idempotent migration scripts that updateMany existing documents: memberType RESTAURANT→STORE and productCollection food values→pet categories. Include a dry-run mode.`

---

## Deployment

### N14 🟢 — Environment & secrets review
- **Prompt:** `Review .env handling for deployment: confirm MONGO_URL/SESSION_SECRET/SECRET_TOKEN are sourced from environment, not committed, and document required env vars for Pettynara.`

### N15 🟢 — Build/deploy pipeline check
- **Prompt:** `Verify npm run build output in dist/ is deployable and document the start command and Node version for production.`

---

## Documentation

### N16 🟢 — Keep docs in sync after each pass
- **Prompt:** `After the domain rename, update docs/BACKEND_MIGRATION.md and docs/COMPLETED_TASKS.md to move STORE/category items from PLANNED to DONE, with validation results.`
