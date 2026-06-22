# Backend Migration — Burak → Pettynara

> Status legend: ✅ **DONE** (completed this session) · 🟡 **PLANNED** (analyzed/decided, not yet executed) · ⚪ **N/A**

This document describes the backend migration of the **Burak** restaurant platform into the **Pettynara** pet-shop platform. The repository in this workspace is **backend-only**.

---

## 1. Original Burak backend — project summary

| Aspect | Detail |
|---|---|
| Domain | Restaurant ordering platform |
| Stack | Node.js · Express 4 · TypeScript · MongoDB · Mongoose 6 |
| Admin UI | Server-side rendered **EJS** panel (`src/views/`) |
| Public API | REST API consumed by a separate React frontend |
| Auth | `express-session` + `connect-mongodb-session`, `bcryptjs`, `jsonwebtoken` |
| Uploads | `multer` → `uploads/`, static assets in `src/public/` |
| Entry | [src/server.ts](../src/server.ts) → [src/app.ts](../src/app.ts) |

**Structure**

| Layer | Path |
|---|---|
| Bootstrap | [src/server.ts](../src/server.ts), [src/app.ts](../src/app.ts) |
| Public REST router | [src/router.ts](../src/router.ts) |
| Admin SSR router | [src/router-admin.ts](../src/router-admin.ts) |
| Controllers | [src/controllers/](../src/controllers/) |
| Services | [src/models/](../src/models/) |
| Mongoose schemas | [src/schema/](../src/schema/) |
| Types & enums | [src/libs/types/](../src/libs/types/), [src/libs/enums/](../src/libs/enums/) |
| EJS views | [src/views/](../src/views/) |
| Static assets | [src/public/](../src/public/) |

---

## 2. New Pettynara backend — project summary

Same architecture and stack; **domain re-skinned** from food/restaurant to pet shop. No framework, routing, or persistence-layer changes. The migration is intentionally staged:

1. ✅ **Brand-rename layer** (this session) — cosmetic identifiers only.
2. 🟡 **Domain layer** (planned) — seller role + product taxonomy.

The package is now named `pettynara` and the admin panel title reads **Pettynara**.

---

## 3. Backend migration goal

Convert the Burak restaurant backend into a pet-shop backend (Pettynara) **without** breaking the REST API contract or existing data shapes, performing the change in safe, independently-verifiable layers (brand → domain).

---

## 4. Naming changes

### ✅ Completed (brand rename)

| File | Before | After |
|---|---|---|
| [package.json](../package.json) | `"name": "burak-loyiha"` | `"name": "pettynara"` |
| [package.json](../package.json) | `"description": "This is a burak project backend"` | `"description": "This is the Pettynara project backend"` |
| [src/app.ts](../src/app.ts) L58 | comment `…Burak ni…` | comment `…Pettynara ni…` |
| [src/views/includes/header.ejs](../src/views/includes/header.ejs) L4 | `<title>Burak</title>` | `<title>Pettynara</title>` |
| [.env](../.env) `MONGO_URL` | `…mongodb.net/Burak?…` | `…mongodb.net/Pettynara?…` |

### 🟡 Planned (domain rename — not yet executed)

| Concept | Before | After |
|---|---|---|
| Seller member role | `MemberType.RESTAURANT` | `MemberType.STORE` |
| Admin controller | `restaurantController` | `storeController` |
| Service method | `getRestaurant()` | `getStore()` |
| Auth guard | `verifyRestaurant` | `verifyStore` |

---

## 5. Module / controller / service changes

| Module | File | Rename status |
|---|---|---|
| Member controller | [src/controllers/memberController.ts](../src/controllers/memberController.ts) | 🟡 `getRestaurant` handler → `getStore` |
| Admin/seller controller | [src/controllers/restaurantController.ts](../src/controllers/restaurantController.ts) | 🟡 file + symbol → `storeController` |
| Product controller | [src/controllers/productController.ts](../src/controllers/productController.ts) | ⚪ no rename |
| Order controller | [src/controllers/orderController.ts](../src/controllers/orderController.ts) | ⚪ no rename |
| Member service | [src/models/Member.service.ts](../src/models/Member.service.ts) | 🟡 `getRestaurant()` + `MemberType.RESTAURANT` query → STORE |
| Product service | [src/models/Product.service.ts](../src/models/Product.service.ts) | ⚪ logic unchanged; affected by enum rename |
| Order / View / Auth services | [src/models/Order.service.ts](../src/models/Order.service.ts), [src/models/View.service.ts](../src/models/View.service.ts), [src/models/Auth.service.ts](../src/models/Auth.service.ts) | ⚪ domain-agnostic |

> Note: the `restaurant` symbols are **domain logic**, not the "Burak" brand, so they were deliberately left untouched by the completed brand-rename layer.

---

## 6. REST API endpoint changes

**The completed rename layer changed ZERO endpoints.** All paths below are unchanged and remain the contract for the React frontend.

### Public API — [src/router.ts](../src/router.ts)

| Method | Path | Handler | Planned change |
|---|---|---|---|
| GET | `/member/restaurant` | `memberController.getRestaurant` | 🟡 optional alias `/member/store` (keep old as deprecated) |
| POST | `/member/login` | `memberController.login` | ⚪ none |
| POST | `/member/signup` | `memberController.signup` | ⚪ none |
| POST | `/member/logout` | `memberController.logout` | ⚪ none |
| GET | `/member/detail` | `memberController.getMemberDetail` | ⚪ none |
| POST | `/member/update` | `memberController.updateMember` | ⚪ none |
| GET | `/member/top-users` | `memberController.getTopUsers` | ⚪ none |
| GET | `/product/all` | `productController.getProducts` | ⚪ none |
| GET | `/product/:id` | `productController.getProduct` | ⚪ none |
| POST | `/order/create` | `orderController.createOrder` | ⚪ none |
| GET | `/order/all` | `orderController.getMyOrders` | ⚪ none |
| POST | `/order/update` | `orderController.updateOrder` | ⚪ none |

### Admin SSR — [src/router-admin.ts](../src/router-admin.ts)

| Method | Path | Handler |
|---|---|---|
| GET | `/` | `restaurantController.goHome` |
| GET/POST | `/login` | `getLogin` / `processLogin` |
| GET/POST | `/signup` | `getSignup` / `processSignup` |
| GET | `/logout` | `logout` |
| GET | `/check-me` | `checkAuthSession` |
| GET | `/product/all` | `productController.getAllProducts` |
| POST | `/product/create` | `productController.createNewProduct` |
| POST | `/product/:id` | `productController.updateChosenProduct` |
| GET | `/user/all` | `restaurantController.getUsers` |
| POST | `/user/edit` | `restaurantController.updateChosenUser` |

**Recommendation:** Keep all paths stable. If domain rename adds `/member/store`, expose it as an **additive alias** and retain `/member/restaurant` until the frontend is updated.

---

## 7. MongoDB collection / schema changes

### Collections — UNCHANGED (by constraint)

| Model | File | Collection |
|---|---|---|
| Product | [src/schema/Product.model.ts](../src/schema/Product.model.ts) | `products` |
| Member | [src/schema/Member.model.ts](../src/schema/Member.model.ts) | `members` |
| Order | [src/schema/Order.model.ts](../src/schema/Order.model.ts) | `orders` |
| OrderItem | [src/schema/OrderItem.model.ts](../src/schema/OrderItem.model.ts) | `orderitems` |
| View | [src/schema/View.model.ts](../src/schema/View.model.ts) | `views` |

### Database name — ✅ CHANGED
Connection target moved from DB `Burak` → `Pettynara` in [.env](../.env). ⚠️ **The `Pettynara` database starts empty**; data in the old `Burak` DB must be migrated separately (`mongodump`/`mongorestore`) if needed.

### Schema field changes — 🟡 PLANNED (enum value renames, no structural change)

| Enum / field | File | Before | After |
|---|---|---|---|
| `MemberType` | [src/libs/enums/member.enum.ts](../src/libs/enums/member.enum.ts) | `RESTAURANT` | `STORE` |
| `ProductCollection` | [src/libs/enums/product.enum.ts](../src/libs/enums/product.enum.ts) | `DISH/SALAD/DESSERT/DRINK/OTHER` | `FOOD/TOY/ACCESSORY/GROOMING/HEALTH` |
| `ProductVolume` | [src/libs/enums/product.enum.ts](../src/libs/enums/product.enum.ts) | drink liters (0.5–2) | weight/kg **or drop** |
| `ProductSize` | [src/libs/enums/product.enum.ts](../src/libs/enums/product.enum.ts) | `SMALL/NORMAL/LARGE/SET` | pet-appropriate sizing |

> ⚠️ Renaming stored enum **string values** is a data migration: existing documents hold old values (`"DISH"`, `"RESTAURANT"`). Plan an `updateMany` backfill or a compatibility mapping.

**Latent bug to fix during domain pass:** schema field `productmages` (typo) in [src/schema/Product.model.ts](../src/schema/Product.model.ts) L55 vs `productImages` in [src/libs/types/product.ts](../src/libs/types/product.ts).

---

## 8. Admin panel / EJS compatibility notes

- Admin panel is SSR EJS in [src/views/](../src/views/) — independent of the React app.
- ✅ Title rebranded in [header.ejs](../src/views/includes/header.ejs).
- 🟡 Remaining brand/domain copy still says "Restaurant": [login.ejs](../src/views/login.ejs) L18, [signup.ejs](../src/views/signup.ejs) L21/L89, hidden field `value="RESTAURANT"` L97, [products.ejs](../src/views/products.ejs) L28/L32 ("RESTAURANT MENU"), hidden `restaurantIid` L219.
- The hidden `memberType` value `"RESTAURANT"` in signup must change **in lockstep** with `MemberType.STORE`, or seller signup breaks.
- Static admin assets ([src/public/css/](../src/public/css/), [src/public/js/](../src/public/js/), [src/public/img/favicon.png](../src/public/img/favicon.png)) are unbranded except favicon — see FRONTEND_MIGRATION for asset swaps.

---

## 9. React frontend compatibility notes

- The React app is **not in this repo**; it consumes the REST API in [src/router.ts](../src/router.ts).
- ✅ Brand rename did **not** alter any endpoint, request body, or response shape — **frontend remains fully compatible** today.
- 🟡 When the domain rename lands, the frontend is affected by: (a) the `RESTAURANT`→`STORE` `memberType` value, (b) renamed product category values, (c) any new `/member/store` alias. Coordinate via additive/deprecated endpoints to avoid a breaking release.
- See [FRONTEND_MIGRATION.md](./FRONTEND_MIGRATION.md) for the full plan.

---

_Source of deferred domain model: project memory `pettynara-migration-model`._
