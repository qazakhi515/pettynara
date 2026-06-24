---
name: pettynara-admin-listings-ui
description: Use this skill when redesigning only the Pettynara Admin product/listings management page in the Burak EJS admin panel, turning the existing restaurant product UI into a pets and pet items listing manager without changing backend routes, input names, controllers, schemas, services, or business logic.
---

# Pettynara Admin Listings UI

## Scope

Only update the admin listings UI:

- `src/views/products.ejs`
- `src/public/css/products.css`

You may inspect:

- `src/public/js/products.js`
- `src/views/includes/header.ejs`
- `src/views/includes/footer.ejs`

## Brand

Use visible brand name/context:

`Pettynara Admin`

This page manages:

- pets
- pet items
- listing images
- price
- stock
- status

Pet categories:

- Dogs
- Cats
- Birds
- Fish
- Rabbits

Pet item categories:

- Food
- Cages
- Aquariums
- Toys
- Collars
- Bowls
- Care products
- Accessories

## Rules

Do not change:

- form action
- input `name` attributes
- select `name` attributes
- backend routes
- controllers
- schemas
- services
- status values
- JS-required class names unless necessary

Keep existing backend contract working.

Important existing route/form contract:

- form action: `/admin/product/create`
- status update route is handled by existing JS
- product status values must stay:
  - `PAUSE`
  - `PROCESS`
  - `DELETE`

Keep these input/select names unchanged:

- `productName`
- `productStatus`
- `productPrice`
- `productLeftCount`
- `productCollection`
- `productSize`
- `productVolume`
- `productDesc`
- `productImages`

## UI Direction

Turn the old restaurant menu page into a modern Pettynara listings manager.

Visual style:

- light dashboard background
- white cards
- clean table
- clear upload area
- deep teal / green primary color
- warm cream or soft amber accents
- compact professional admin layout
- 8px border radius
- no old gradient background
- no restaurant wording
- no dark theme
- no purple gradient

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

## Table UI

Visible page/table title:

`Pet Listings`

or:

`Pets & Items`

Visible columns:

- `No`
- `Name`
- `Category`
- `Type / Size`
- `Price`
- `Stock`
- `Status`

Data bindings should stay unchanged:

- `value.productName`
- `value.productCollection`
- `value.productVolume`
- `value.productSize`
- `value.productPrice`
- `value.productLeftCount`
- `value.productStatus`
- `value._id`

## Create Form UI

Visible form title:

`Add New Pet / Item`

Visible labels:

- `Pet / Item Name`
- `Price`
- `Stock`
- `Category`
- `Size / Type`
- `Description`
- `Upload Images`

Keep form behavior unchanged.

## Category Labels

In the first UI-only pass, you may change only visible option labels, but keep option values unchanged if backend enum has not been migrated yet.

Current values likely must stay:

- `DISH`
- `SALAD`
- `DESSERT`
- `DRINK`
- `OTHER`

Temporary visible labels may be:

```html
<option value="DISH">Dog</option>
<option value="SALAD">Cat</option>
<option value="DESSERT">Bird</option>
<option value="DRINK">Fish</option>
<option value="OTHER">Rabbit / Item</option>
```
