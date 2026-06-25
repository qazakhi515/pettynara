---
name: pettynara-admin-home-ui
description: Use this skill when redesigning the Pettynara Admin home page in the Burak EJS admin panel into a modern petshop marketplace dashboard with hero section, stat cards, pet category cards, quick actions, recent activity, and real downloaded pet-related images.
---

# Pettynara Admin Home UI

## Scope

Only update the admin home page UI:

- `src/views/home.ejs`
- `src/public/css/home.css`

You may inspect:

- `src/views/includes/header.ejs`
- `src/views/includes/footer.ejs`
- `src/public/css/main.css`

## Goal

Replace the simple Pettynara Admin home page with a modern, premium petshop marketplace admin dashboard.

The result should feel like a real SaaS dashboard for managing:

- pets
- pet items
- sellers
- users
- orders

## Backend Safety Rules

Do not change:

- backend routes
- controllers
- schemas
- services
- session logic
- auth logic
- existing href destinations

Keep current admin navigation behavior working.

## Existing Route Links

Keep hrefs unchanged:

- `/admin`
- `/admin/signup`
- `/admin/login`
- `/admin/product/all`
- `/admin/user/all`
- `/admin/logout`

## Brand

Use visible brand name:

`Pettynara Admin`

Main heading:

`Welcome to Pettynara Admin`

Supporting text:

`Manage pets, pet items, sellers, and customer orders from one smart dashboard.`

## Visual Direction

Build a modern dashboard-style home page.

Use:

- warm off-white page background
- white cards
- deep teal / green primary color
- soft cream accents
- subtle amber or coral highlights
- dark slate text
- 8px border radius
- clean grid layout
- readable spacing
- responsive desktop layout

Avoid:

- old Bootstrap look
- empty plain boxes
- restaurant wording
- purple gradient
- dark theme
- excessive animation
- childish cartoon-heavy style
- huge empty bottom space

## Layout Requirements

Use this page structure:

1. Top navigation
2. Hero section
3. Metric cards
4. Pet category cards
5. Quick action cards
6. Recent activity panel

## Top Navigation

Logged-out visible links:

- `Home`
- `Create account`
- `Login`

Logged-in visible links:

- `Dashboard`
- `Pets & Items`
- `Users`
- `Logout`

Preserve existing EJS auth checks using `member`.

## Hero Section

Create a polished hero area.

Left side:

- eyebrow: `Pettynara Admin`
- title: `Welcome to Pettynara Admin`
- subtitle: `Manage pets, pet items, sellers, and customer orders from one smart dashboard.`
- CTA buttons:
  - `Manage Pets & Items`
  - `View Users`

Right side:

- mini dashboard preview card
- petshop visual card cluster
- small image thumbnail or pet-related card

Keep CTA hrefs:

- `Manage Pets & Items` -> `/admin/product/all`
- `View Users` -> `/admin/user/all`

For logged-out state, CTA can point to:

- `Create account` -> `/admin/signup`
- `Login` -> `/admin/login`

## Metric Cards

Show four metric cards:

- `Pets`
- `Pet Items`
- `Users`
- `Orders`

These can be static UI cards for now. Do not require backend counts yet.

Each card should have:

- title
- short helper text
- small visual icon/image/accent

## Category Cards

Show category cards:

- `Dogs`
- `Cats`
- `Birds`
- `Fish`
- `Rabbits`
- `Accessories`

Each category card should include:

- category name
- short subtitle
- real image or image thumbnail
- clean card styling

## Images

Use real petshop-related images.

Important:

- Download or use internet images for category thumbnails.
- Prefer free/stock-safe image URLs from sources like Unsplash or Pexels if internet access is available.
- Save images locally into the project public assets folder, for example:
  - `src/public/img/pettynara/dogs.jpg`
  - `src/public/img/pettynara/cats.jpg`
  - `src/public/img/pettynara/birds.jpg`
  - `src/public/img/pettynara/fish.jpg`
  - `src/public/img/pettynara/rabbits.jpg`
  - `src/public/img/pettynara/accessories.jpg`

If internet download is unavailable:

- use existing local placeholder images temporarily
- keep image paths easy to replace later
- do not block the UI work only because images are missing

Do not hotlink images directly in final EJS unless the project convention allows it. Prefer local saved images.

## Quick Actions

Create three quick action cards:

- `Manage Pets & Items`
- `View Users`
- `Review Orders`

Current working links:

- `Manage Pets & Items` -> `/admin/product/all`
- `View Users` -> `/admin/user/all`

If orders admin route does not exist yet, keep `Review Orders` as disabled/static UI or point it nowhere safely.

## Recent Activity

Add a simple static recent activity panel.

Example visible text:

- `Recent Activity`
- `New pet listings are ready to be reviewed.`
- `Seller accounts can be managed from Users.`
- `Pet item inventory can be updated from Pets & Items.`

This is UI-only for now; do not add backend logic.

## Responsive Behavior

Desktop:

- max-width centered layout
- hero split into two columns
- metric cards in four columns
- categories in three columns
- quick actions in three columns

Tablet/mobile:

- stack cards into one or two columns
- avoid overflow
- text must wrap cleanly

## Validation

After editing:

1. `/admin` should render.
2. Logged-out state should show `Home`, `Create account`, `Login`.
3. Logged-in state should show `Dashboard`, `Pets & Items`, `Users`, `Logout`.
4. `/admin/product/all` link should still work.
5. `/admin/user/all` link should still work.
6. `/admin/signup` link should still work.
7. `/admin/login` link should still work.
8. Category images should load from local public paths.
9. Page should look good on desktop width.
10. No backend logic should be changed.
