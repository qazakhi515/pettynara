# Frontend Migration Plan — Burak → Pettynara (React)

> ⚠️ **Assumption note:** The React frontend is **not present in this workspace** (this repo is backend-only). The page/component mappings below are based on the **standard Burak React (MERN) structure** and the **actual backend REST contract** in [../src/router.ts](../src/router.ts). **Verify every mapping against the real frontend repo before executing.**

> Status legend: 🟡 PLANNED · ✅ backend-side already done

---

## 0. Guiding principle
The backend REST contract is currently **unchanged** by the brand rename, so the frontend keeps working today. Frontend migration is therefore **brand/UX-first**, with domain-vocabulary changes rolled out **after** the backend domain pass and behind **additive/aliased** endpoints (see [DECISIONS.md](./DECISIONS.md) F2/A2).

---

## 1. Step-by-step migration plan

| # | Step | Notes |
|---|---|---|
| 1 | Inventory the frontend repo | List pages, components, routes, API client, asset/theme files. Confirm the assumptions in this doc. |
| 2 | Branding pass (low risk) | App name, `<title>`, logo, favicon, colors, copy → Pettynara. No API impact. |
| 3 | Terminology pass (UI copy) | "Restaurant/Menu/Dish" → "Store/Catalog/Product" in visible strings only. |
| 4 | API client alignment | Keep calling existing endpoints. Add a thin mapping layer for `memberType` and product-category values so the UI can show pet vocabulary while the backend still returns old values. |
| 5 | Adopt backend domain rename | When backend ships `STORE` + pet categories + `/member/store` alias, switch the client to new values; remove the mapping shim. |
| 6 | Asset replacement | Swap logo/favicon/imagery/illustrations to pet theme. |
| 7 | QA & regression | Manual click-through of auth, catalog, cart/order, seller (store) flows against the Pettynara backend. |
| 8 | Cleanup | Remove deprecated `restaurant` references and the compatibility shim once backend deprecates old vocabulary. |

---

## 2. Page / component map (assumption-based — verify)

| Burak (old) | Pettynara (new) | Backend endpoint used | Change type |
|---|---|---|---|
| `HomePage` | `HomePage` | `/product/all`, `/member/restaurant` → `/member/store` | branding + copy |
| `ProductsPage` ("Menu") | `ProductsPage` ("Catalog") | `/product/all`, `/product/:id` | terminology |
| `ProductCard` (dish) | `ProductCard` (pet item) | — | category labels |
| `OrdersPage` / `MyOrders` | `OrdersPage` | `/order/all`, `/order/create`, `/order/update` | branding only |
| `MyPage` / profile | `MyPage` | `/member/detail`, `/member/update` | branding only |
| `SignupPage` (restaurant/user) | `SignupPage` (store/user) | `/member/signup` | `memberType` value `RESTAURANT`→`STORE` |
| `LoginPage` | `LoginPage` | `/member/login` | branding only |
| `HelpPage` / static | `HelpPage` | — | copy |
| Brand/Logo component | Brand/Logo component | — | asset swap |
| Category filter (Dish/Salad/Dessert/Drink) | Category filter (Food/Toy/Accessory/Grooming/Health) | `/product/all?productCollection=` | enum value rename |

---

## 3. REST request/response rename plan

The shapes are stable; only **enum string values** change once the backend domain pass lands.

| Field | Where | Old value(s) | New value(s) | Frontend action |
|---|---|---|---|---|
| `memberType` | signup request, member responses | `USER`, `RESTAURANT` | `USER`, `STORE` | map in API client until cutover |
| `productCollection` | product list/detail, filters | `DISH/SALAD/DESSERT/DRINK/OTHER` | `FOOD/TOY/ACCESSORY/GROOMING/HEALTH` | map labels; update filter options |
| `productVolume` | product detail | drink liters | weight/kg or removed | update unit label or hide |
| `productSize` | product detail | `SMALL/NORMAL/LARGE/SET` | pet sizing | update size selector |
| `productImages` | product detail | (backend typo `productmages`) | `productImages` | confirm field name after backend fix |

**Compatibility shim (interim):** centralize a `MEMBER_TYPE` / `CATEGORY` map in the API client so a single edit flips the vocabulary at cutover.

---

## 4. Route changes (frontend router)

| Old route | New route | Rationale |
|---|---|---|
| `/` | `/` | unchanged |
| `/products` (menu) | `/products` (catalog) | keep path, change copy |
| `/orders` | `/orders` | unchanged |
| `/member-page` | `/member-page` | unchanged |
| `/login`, `/signup` | `/login`, `/signup` | unchanged |

Keep **frontend route paths stable**; change labels/breadcrumbs/nav text only. This avoids breaking bookmarks and SEO and keeps the diff small.

---

## 5. UI terminology changes

| Old term | New term |
|---|---|
| Restaurant | Store |
| Menu | Catalog / Products |
| Dish / Meal | Product / Item |
| Salad / Dessert / Drink | Food / Toy / Accessory / Grooming / Health |
| "Order food" | "Order products" |
| Chef / Kitchen (if present) | (remove or "Shop") |

---

## 6. Branding, assets, logo, favicon, colors, copy

| Asset / token | Action |
|---|---|
| App name / `<title>` | "Burak" → "Pettynara" |
| Logo | Replace restaurant logo with Pettynara pet logo (SVG + raster) |
| Favicon | Replace (backend admin favicon at [../src/public/img/favicon.png](../src/public/img/favicon.png) is a separate file — swap both) |
| Color palette | Define Pettynara brand palette; update theme/SCSS/`:root` vars |
| Hero / banner imagery | Food imagery → pet imagery |
| Marketing copy | Restaurant tagline → pet-shop tagline |
| Fonts | Keep unless brand guide dictates change |
| Email/meta/OG tags | Update brand name, description, OG image |

---

## 7. Sequencing & risk

1. Branding + copy first (no API dependency) — ship anytime.
2. Domain-value cutover **after** backend domain pass + alias endpoints exist.
3. Use the API-client mapping shim to decouple the two; remove it last.

_Backend status feeding this plan: see [BACKEND_MIGRATION.md](./BACKEND_MIGRATION.md) and [COMPLETED_TASKS.md](./COMPLETED_TASKS.md)._
