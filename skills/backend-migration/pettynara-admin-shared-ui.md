---
name: pettynara-admin-shared-ui
description: Use this skill when applying shared Pettynara Admin UI polish across the Burak EJS admin panel, including global title, shared CSS base styles, common navigation consistency, buttons, inputs, cards, tables, and brand-level visual cleanup without changing backend logic.
---

# Pettynara Admin Shared UI

## Scope

Update shared admin UI polish only.

Primary files:

- `src/views/includes/header.ejs`
- `src/public/css/main.css`

Optional files if consistency requires it:

- `src/views/includes/footer.ejs`
- `src/public/css/home.css`
- `src/public/css/login.css`
- `src/public/css/signup.css`
- `src/public/css/products.css`
- `src/public/css/users.css`

## Brand

Use visible brand name:

`Pettynara Admin`

Petshop marketplace context:

- pets
- pet items
- sellers
- users
- orders

## Rules

Do not change:

- backend routes
- form actions
- input names
- controllers
- schemas
- services
- session logic
- API behavior

Only change shared UI/presentation.

## Header

Update visible document title from old brand to:

`Pettynara Admin`

Keep Bootstrap and existing scripts unless intentionally replacing them in a later step.

Do not remove scripts that existing pages depend on:

- jQuery
- Bootstrap JS
- axios
- `/js/main.js`

## Global CSS Direction

Use `main.css` for safe shared base styling:

- font family
- body background
- link defaults
- table baseline
- button baseline
- input/select baseline
- reusable color variables if desired

Visual style:

- white / soft gray base
- deep teal or green primary
- warm cream subtle accents
- coral/amber small highlights
- clean card/table surfaces
- 8px border radius

Avoid:

- old gradient-heavy backgrounds
- purple gradient
- dark admin theme
- restaurant wording
- excessive animations

## Shared Navigation Consistency

Across admin pages, visible nav text should be consistent:

- `Dashboard`
- `Pets & Items`
- `Users`
- `Logout`

For logged-out pages:

- `Home`
- `Create account`
- `Login`

Keep hrefs unchanged:

- `/admin`
- `/admin/`
- `/admin/signup`
- `/admin/login`
- `/admin/product/all`
- `/admin/user/all`
- `/admin/logout`

## Shared Component Style

Prefer consistent styles for:

- cards
- tables
- form inputs
- select dropdowns
- primary buttons
- danger/cancel buttons
- upload boxes

Do not change class names if JS depends on them.

## Validation

After shared UI polish:

1. `/admin` renders.
2. `/admin/login` renders.
3. `/admin/signup` renders.
4. `/admin/product/all` renders.
5. `/admin/user/all` renders.
6. Login/signup forms still submit.
7. Product/listing create form still submits.
8. Status dropdowns still work.
9. Existing JS files still load.
