---
name: pettynara-admin-auth-ui
description: Use this skill when redesigning only the Pettynara Admin login and signup pages in the Burak EJS admin panel without changing backend routes, input names, controllers, schemas, services, or business logic.
---

# Pettynara Admin Auth UI

## Scope

Only update the admin auth UI:

- `src/views/login.ejs`
- `src/views/signup.ejs`
- `src/public/css/login.css`
- `src/public/css/signup.css`

## Brand

Use visible brand name:

`Pettynara Admin`

Petshop marketplace context:

- dogs
- cats
- birds
- fish
- rabbits
- pet food
- toys
- cages
- aquariums
- accessories

## Rules

Do not change:

- form actions
- input `name` attributes
- backend routes
- controllers
- schemas
- services
- JS validation class names unless necessary

Keep existing backend contract working.

## UI Direction

Create a modern, clean admin auth experience:

- white card layout
- soft cream or light gray page background
- deep teal / green primary color
- small coral or amber accent
- professional petshop admin feel
- no old animated gradient
- no restaurant wording
- no purple gradient

## Login Text

Use visible labels like:

- `Pettynara Admin`
- `Seller Login`
- `Manage pets, pet items, and customer orders from one dashboard.`
- `Seller name`
- `Password`
- `Login`
- `Create account`

Keep input names:

- `memberNick`
- `memberPassword`

## Signup Text

Use visible labels like:

- `Create Pettynara Seller Account`
- `Start managing pets and pet items today.`
- `Seller name`
- `Phone`
- `Password`
- `Repeat password`
- `Store image`
- `Upload Image`
- `Create account`

Keep input names:

- `memberNick`
- `memberPhone`
- `memberPassword`
- `confirmPassword`
- `memberImage`
- `memberType`

## Validation

After editing:

1. `/admin/login` should render.
2. `/admin/signup` should render.
3. Login form should still POST to `/admin/login`.
4. Signup form should still POST to `/admin/signup`.
5. Image upload input should still work.
