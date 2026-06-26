---
name: pettynara-backend-pet-helpers-model
description: Use this skill when adding Pet Helpers domain logic to the Pettynara backend, including schema, types, enums, and service structure for people who can help dogs, cats, birds, fish, rabbits, and pet owners.
---

# Pettynara Backend Pet Helpers Model

## Goal

Add a new Pet Helpers domain to Pettynara.

A Pet Helper is a person who can help pet owners with animals such as dogs, cats, birds, fish, and rabbits.

## Entity

Create `PetHelper`.

Suggested fields:

- `helperStatus`
- `helperNick`
- `helperPhone`
- `helperPassword`
- `helperImage`
- `helperLocation`
- `helperAnimals`
- `helperExperience`
- `helperDesc`
- `helperLikes`
- `helperViews`

## Status

Use enum:

- `ACTIVE`
- `BLOCK`
- `DELETE`

## Animal Categories

Use enum:

- `DOG`
- `CAT`
- `BIRD`
- `FISH`
- `RABBIT`
- `OTHER`

## Rules

Do not modify existing Member/Product/Order logic in the first pass.

Add PetHelper as a separate domain.

Do not break existing admin, product, member, and order APIs.

## Files To Add

- `src/schema/PetHelper.model.ts`
- `src/models/PetHelper.service.ts`
- `src/controllers/petHelperController.ts`
- `src/libs/types/petHelper.ts`
- `src/libs/enums/petHelper.enum.ts`

## Validation

After implementation:

1. Backend should compile.
2. Existing routes should still work.
3. PetHelper model should be importable.
4. PetHelper service should support create/list/detail/update basics.
