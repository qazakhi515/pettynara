# Pettynara Backend Agent Instruction

Pettynara is an Express REST API migrated from a restaurant platform into a pet shop platform.

## Read First

Before changing code, read the current AI handoff docs:

- `docs/BACKEND_MIGRATION.md`
- `docs/DECISIONS.md`
- `docs/FRONTEND_MIGRATION.md`
- `docs/COMPLETED_TASKS.md`
- `docs/NEXT_STEPS.md`
- `docs/PROMPTS.md`

Use those files as the source of truth for AI Agent related migration history, accepted decisons, remaining work and validation.

## Pettynara Project Guide

### Project Shape

- Backend: `Burak loyiha` — now adapted for Pettynara.
  - Node.js, Express, TypeScript
  - REST API
  - MongoDB/Mongoose
  - EJS admin panel
- Frontend: `burak-react` — now adapted for Pettynara.
  - React
  - React Router
  - Redux/state management
  - Axios REST API client
- Keep the existing architecture and REST API approach.
- Do not introduce GraphQL or unnecessary new patterns.

### Domain Rules

- Use Pettynara pet-platform terminology consistently.
- Main domain should focus on pets, pet products, pet food, toys, accessories, and care items.
- Do not reintroduce old Burak/restaurant/food-service terminology.
- Keep existing auth roles, REST endpoints, and MongoDB collections stable unless a task explicitly requires cleanup.
- Rename internal files, variables, schemas, or database fields only when it is safe and validated.

### Workflow

1. Analyze before editing.
2. Make small, focused changes.
3. Follow existing backend and frontend patterns.
4. Change one feature or page at a time.
5. Keep backend and frontend changes separate when possible.
6. Validate after important changes.
7. Update `docs/ai/COMPLETED_TASKS.md` after major completed work.

### Validation

Backend:

```bash
cd "Pettynara"
npm run build
```
