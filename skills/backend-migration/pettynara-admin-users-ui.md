---
name: pettynara-admin-users-ui
description: Use this skill when redesigning only the Pettynara Admin users page in the Burak EJS admin panel, turning the existing users table into a clean users and sellers management UI without changing backend routes, controllers, schemas, services, status values, or business logic.
---

# Pettynara Admin Users UI

## Scope

Only update the admin users UI:

- `src/views/users.ejs`
- `src/public/css/users.css`

You may inspect:

- `src/public/js/users.js`
- `src/views/includes/header.ejs`
- `src/views/includes/footer.ejs`

## Brand

Use visible brand/context:

`Pettynara Admin`

This page manages:

- users
- sellers
- member status
- customer access

## Rules

Do not change:

- backend routes
- controllers
- schemas
- services
- status values
- select class names used by JS
- EJS data bindings

Keep status values unchanged:

- `ACTIVE`
- `BLOCK`
- `DELETE`

Keep existing route behavior:

- `/admin/user/all`
- `/admin/user/edit`

Keep data bindings unchanged:

- `value._id`
- `value.memberNick`
- `value.memberPhone`
- `value.memberStatus`

## UI Direction

Create a clean modern admin users table.

Visual style:

- light dashboard background
- white table/card area
- deep teal or green accents
- soft gray table borders
- clear status dropdown
- 8px border radius
- no old gradient background
- no restaurant wording
- no purple gradient
- no dark theme

## Navigation Text

Visible nav text should become:

- `Dashboard`
- `Pets & Items`
- `Users`
- `Logout`

Keep hrefs unchanged:

- `/admin/`
- `/admin/product/all`
- `/admin/user/all`
- `/admin/logout`
- `/admin/signup`
- `/admin/login`

## Logged-Out State

Preserve existing EJS logic:

- if `!member`, show login/signup navigation
- show message that user must login first

Suggested visible message:

`Please login to manage Pettynara users and sellers.`

## Logged-In State

Visible page title:

`Users / Sellers`

Optional subtitle:

`Manage customer and seller access for Pettynara.`

Table columns:

- `No`
- `Name`
- `Phone`
- `Status`

Keep the status select class unchanged:

`member-status`

Keep select `id` as user id:

`id="<%= value._id%>"`

## Validation

After editing:

1. `/admin/user/all` should render.
2. Logged-out state should still show login/signup navigation.
3. Logged-in state should show users table.
4. Status dropdown should still update through existing JS.
5. Values `ACTIVE`, `BLOCK`, and `DELETE` should remain unchanged.
