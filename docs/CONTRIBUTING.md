# FestSphere Contributing Guide

## 1. Project Structure

```text
frontend/
  src/
    components/
    pages/
    hooks/
    services/
    store/
    styles/
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
    validators/
docs/
  design/
```

## 2. Branch Strategy

- main: production-ready code
- develop: integration branch
- feature/*: feature development
- bugfix/*: bug fixes
- hotfix/*: urgent production fixes

## 3. Commit Convention

Use clear, descriptive commit messages.

Examples:
- feat(auth): add JWT refresh flow
- fix(registration): prevent duplicate event registration
- docs(api): update payment endpoints

## 4. Naming Conventions

- Files: kebab-case or camelCase depending on project standards
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Routes: lowercase with hyphenated segments where needed

## 5. Folder Standards

- Keep feature-specific files grouped together.
- Separate shared utilities from feature-specific logic.
- Maintain consistent naming across frontend and backend modules.

## 6. Coding Standards

- Write clear and self-documenting code.
- Prefer small, focused modules.
- Add comments only where necessary.
- Keep error handling explicit and consistent.
- Follow existing architectural patterns and avoid ad hoc solutions.

## 7. Pull Request Checklist

- [ ] Code is formatted and linted
- [ ] Relevant tests are added or updated
- [ ] Documentation is updated when behavior changes
- [ ] Security and validation concerns are addressed
- [ ] PR description clearly explains the change

## 8. Review Checklist

- [ ] Feature aligns with product requirements
- [ ] API changes are documented
- [ ] Database changes are considered and documented
- [ ] Accessibility and responsive behavior are reviewed
- [ ] Security implications are discussed
