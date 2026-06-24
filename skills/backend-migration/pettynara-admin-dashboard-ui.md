---
name: pettynara-admin-dashboard-ui
description: Use this skill when redesigning only the Pettynara Admin home/dashboard page in the Burak EJS admin panel without changing backend routes, controllers, schemas, services, or business logic.
---

# Pettynara Admin Dashboard UI

## Scope

Only update the admin home/dashboard UI:

- `src/views/home.ejs`
- `src/public/css/home.css`

You may inspect:

- `src/views/includes/header.ejs`
- `src/views/includes/footer.ejs`

## Brand

Use visible brand name:

`Pettynara Admin`

Petshop marketplace context:

- dogs
- cats
- birds
- fish
- rabbits
- pet items
- sellers
- users
- orders

## Rules

Do not change:

- backend routes
- controllers
- schemas
- services
- session logic
- auth logic

Keep current admin navigation behavior working.

## UI Direction

Replace the old abstract animation home screen with a clean modern dashboard welcome page.

Visual style:

- white / soft gray background
- deep teal or green primary color
- warm cream accent blocks
- clean dashboard cards
- 8px border radius
- modern admin feel
- no old animated sphere
- no restaurant wording
- no purple gradient
- no dark dashboard

## Navigation Text

When logged out, show links like:

- `Home`
- `Create account`
- `Login`

When logged in, show links like:

- `Dashboard`
- `Pets & Items`
- `Users`
- `Logout`

Keep hrefs unchanged:

- `/admin`
- `/admin/signup`
- `/admin/login`
- `/admin/product/all`
- `/admin/user/all`
- `/admin/logout`

## Dashboard Content

Use visible text like:

- `Welcome to Pettynara Admin`
- `Manage pets, pet items, sellers, and customer orders in one place.`
- `Pets`
- `Pet Items`
- `Users`
- `Orders`

Suggested category cards:

- `Dogs`
- `Cats`
- `Birds`
- `Fish`
- `Rabbits`
- `Accessories`

Suggested quick actions:

- `Manage Pets & Items`
- `View Users`

## Auth State

Preserve existing EJS logic:

- if `!member`, show signup/login navigation
- if `member`, show product/users/logout navigation

Do not remove `member` checks.

## Validation

After editing:

1. `/admin` should render for logged-out users.
2. Signup and login links should work.
3. After login, `/admin` should show dashboard navigation.
4. `/admin/product/all` link should still work.
5. `/admin/user/all` link should still work.
6. `/admin/logout` link should still work.
