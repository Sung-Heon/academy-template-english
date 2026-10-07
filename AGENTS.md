# Academy App Agent Rules
1. Never delete existing database columns automatically.
2. Never perform destructive database migrations.
3. All schema changes require a migration.
4. Do not modify authentication infrastructure unless explicitly requested.
5. Do not modify payment infrastructure.
6. Do not expose secrets to client-side code.
7. Prefer existing UI components.
8. Avoid adding dependencies unless necessary.
9. Preserve existing behavior unless required by the user request.
10. Run lint, typecheck, tests and build before completing a task.
11. Existing tests must continue to pass.
12. Never connect to production databases from an AI sandbox.
13. New deployments use Turso (SQLite/libSQL). Write parameterized SQLite-compatible SQL and additive migrations. Keep existing migrations immutable; Neon remains supported for existing apps.
14. The platform provisions remote schemas and seed data before deployment. Never write to a remote database during app startup.
- Preserve LevelTest. Student.level describes English proficiency. Homework belongs to Class.
