---
name: pettynara-admin-products-create-ui
description: Use this skill when redesigning the Burak admin product page and create product form into a Pettynara Admin pets and pet items management UI, without changing backend routes, input names, enum values, controllers, schemas, or services.
---

# Pettynara Admin Products Create UI

## Scope

Only update UI for:

- `src/views/products.ejs`
- `src/public/css/products.css`

You may inspect but avoid changing unless necessary:

- `src/public/js/products.js`

## Goal

Replace the Burak restaurant menu/product UI with a modern Pettynara pets and pet items admin page.

The page should feel like:

`Pets & Items Management`

not:

`Restaurant Menu` or `Product Management`.

## Do Not Change

Do not change backend contract:

- form action
- input names
- select names
- route paths
- status values
- JS IDs/classes used for behavior

Keep unchanged:

- `/admin/product/all`
- `/admin/product/create`
- `productName`
- `productPrice`
- `productLeftCount`
- `productCollection`
- `productSize`
- `productVolume`
- `productDesc`
- `productImages`
- `productStatus`

Keep button IDs if JS uses them:

- `process-btn`
- `cancel-btn`
- `create-btn`

## Page Title

Use:

`Pets & Items`

Subtitle:

`Manage pet listings, supplies, stock, pricing, and visibility.`

Avoid:

- `Restaurant Menu`
- `Product Detail`
- `Dish`
- `Drink`
- `Menu`

## Table UI

Replace visible table heading with:

`Pettynara Listings`

Table columns:

- `No`
- `Listing Name`
- `Category`
- `Type`
- `Price`
- `Stock`
- `Status`

Keep data bindings unchanged:

- `value.productName`
- `value.productCollection`
- `value.productVolume`
- `value.productSize`
- `value.productPrice`
- `value.productLeftCount`
- `value.productStatus`
- `value._id`

## Create Button

Change visible button:

`New Product`

to:

`Add Pet / Item`

## Create Form

Form title:

`Create Pet / Item Listing`

Visible labels:

- `Pet / Item Name`
- `Price`
- `Stock`
- `Category`
- `Size / Type`
- `Description`
- `Upload Images`

Submit button:

`Create Listing`

Cancel button:

`Cancel`

## Category Select

Important: first UI pass only changes labels, not values.

Keep values same until backend enum migration:

```html
<option value="DISH">Dog</option>
<option value="SALAD">Cat</option>
<option value="DESSERT">Bird</option>
<option value="DRINK">Fish</option>
<option value="OTHER">Rabbit / Accessory</option>
```
