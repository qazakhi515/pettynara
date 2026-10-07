# Completed Tasks — This Session

Scope of this session: **analysis + a safe brand-rename layer** for the Burak → Pettynara backend migration. No domain logic was changed.

---

## Backend changes

### 1. Analysis / discovery (no file changes)
- Mapped the backend architecture (routers, controllers, services, schemas, enums, EJS).
- Produced a restaurant → pet-shop transformation map.
- Recorded the target domain model to project memory (`pettynara-migration-model`): seller `STORE`, categories `FOOD/TOY/ACCESSORY/GROOMING/HEALTH`.

### 2. Safe brand rename (Burak → Pettynara) — 4 source files

| File | Change |
|---|---|
| [package.json](../package.json) | `name`: `burak-loyiha` → `pettynara`; `description` updated |
| [src/app.ts](../src/app.ts) L58 | rebranded code comment (comment only) |
| [src/views/includes/header.ejs](../src/views/includes/header.ejs) L4 | `<title>Burak</title>` → `<title>Pettynara</title>` |
| [.env](../.env) | `MONGO_URL` database name `/Burak` → `/Pettynara` |

### 3. Generated-artifact regeneration (not hand-edited)
- `package-lock.json` regenerated via `npm install`.
- `dist/` regenerated via `npm run build`.

### 4. Documentation (this folder)
- Created `docs/` with `BACKEND_MIGRATION.md`, `DECISIONS.md`, `FRONTEND_MIGRATION.md`, `COMPLETED_TASKS.md`, `NEXT_STEPS.md`, `PROMPTS.md`.

**Explicitly preserved (by constraint):** all REST routes, all Mongoose models/collections (`Product/Member/Order/OrderItem/View`), and all `restaurant`/food domain identifiers.

---

## Frontend changes
**None.** The React frontend is a separate repo, not in this workspace. No frontend code was touched this session. The brand rename did not alter the API contract, so the frontend remains compatible.

---

## Validation status

| Check | Status | Detail |
|---|---|---|
| Typecheck (`npx tsc --noEmit`) | ✅ PASS | No type errors after edits |
| Build (`npm run build`) | ✅ PASS | `dist/` regenerated cleanly |
| Dependency lock (`npm install`) | ✅ OK | `package-lock.json` updated to `pettynara` |
| Residual brand grep | ✅ CLEAN | `grep -rni burak` (excl. node_modules/.git) → 0 matches |
| Lint | ⚪ N/A | No linter configured (`.hintrc` = webhint, not a TS linter) |
| Automated tests | ⚪ NONE | `npm test` is a placeholder (`exit 1`); no test suite exists |
| Runtime smoke test | ❌ NOT RUN | Server not started against the new `Pettynara` DB |

---

## Not yet validated / open items
- **Runtime boot** against the new empty `Pettynara` database (no smoke test performed).
- **Data availability:** the `Pettynara` DB is empty; old `Burak` data not migrated. App may appear "data-less" until a `mongodump`/`mongorestore` is run.
- **Admin EJS flows** (login/signup/products) not exercised post-rename.
- **Domain migration** (RESTAURANT→STORE, category enums, `productmages` typo) **not started** — only analyzed/decided.
- No end-to-end frontend↔backend integration check.

---

## S3 image uploads (2026-10-06, branch `feat/s3-uploads`)

Product and member images move from the local `./uploads` folder to the S3 bucket `pettynara-uploads-2026` (ap-northeast-2), so the backend no longer keeps state on disk.

| File | Change |
|---|---|
| [src/libs/utils/s3.ts](../src/libs/utils/s3.ts) | New: shared S3 client, `putImageToS3()` returns the public URL |
| [src/libs/utils/uploader.ts](../src/libs/utils/uploader.ts) | S3 when `AWS_REGION` + `AWS_S3_BUCKET` are set, local disk otherwise; images only, 5 MB per file; `file.path` holds the stored value, so controllers are unchanged |
| [src/views/products.ejs](../src/views/products.ejs) | Admin thumbnails accept full S3 URLs as well as old `uploads/...` paths |
| [src/scripts/migrateUploadsToS3.ts](../src/scripts/migrateUploadsToS3.ts) | New one-off migration: dry run by default, `--apply` uploads files and rewrites DB paths; re-runnable |
| `package.json` | Added `@aws-sdk/client-s3` |

New env vars: `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

Frontend counterpart: `Pettynara-react` branch `feat/s3-image-urls` adds `getImageUrl()` in `src/lib/config.ts` and routes all 22 stored-image `<img>` URLs through it. **Deploy the frontend together with (or before) this backend change.**

| Check | Status |
|---|---|
| `npm run build` (backend) | ✅ PASS |
| Uploader smoke test: disk mode, non-image rejection, real S3 upload + public GET 200 | ✅ PASS |
| Admin `products.ejs` render with S3 / legacy / no image | ✅ PASS |
| Migration dry run against the production DB | ✅ 24 files, 21 products, 2 members; 3 member avatars exist only on the server |
| Frontend `npm run build` | ✅ PASS |
| Migration `--apply` on the server | ❌ NOT RUN — must run on the server, where all upload files exist |

---

## Redis: rate limiting, caching, admin sessions (2026-10-08, branch `feat/redis`)

Optional Redis (`REDIS_URL`); without it rate limits and sessions stay in memory and nothing is cached.

- `src/libs/redis.ts`: lazy `ioredis` client, fail-fast commands, `waitForRedis()` used by `server.ts` before listening.
- `src/libs/utils/rateLimit.ts`: `rate-limiter-flexible`; login 5 wrong passwords per IP+nick and 20 attempts per IP per 15 min, signup 5 per IP per hour, admin login IP limit; `429` + `Retry-After`; in-memory insurance limiter if Redis fails.
- `src/libs/utils/cache.ts`: cache-aside, 60 s TTL for `/product/all` and `/member/top-users`; product lists invalidated by bumping `cache:products:version` on admin create/update.
- `src/app.ts`: `trust proxy` = 1 (Nginx) so `req.ip` is the client IP; admin sessions moved from `connect-mongodb-session` to `connect-redis` (package removed). Existing admin sessions end on deploy.
- `docker-compose.yml`: `redis:7-alpine`, no published port, 64 MB, `volatile-lru`, `redis-data` volume.
- Tests: `tests/rateLimit.test.ts`, `tests/redis.test.ts`; `tests/setup.ts` flushes Redis and resets limiters; Jest `forceExit` removed. CI runs tests without and with a Redis service.

| Check | Status |
|---|---|
| `npm run build` | ✅ |
| Tests without Redis | ✅ 92 passed, 6 skipped |
| Tests with local Redis (Docker) | ✅ 97 passed, 1 skipped |
| App with unreachable Redis | ✅ lists 200, signup 201, 6th wrong login 429 (memory fallback) |
| Server deploy (`REDIS_URL=redis://redis:6379` in `.env`) | ❌ NOT DONE |
