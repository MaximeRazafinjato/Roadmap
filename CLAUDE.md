# FtelMap Backend (.NET 9) Project

## Project Structure

-   **FtelMap.sln** - Main solution file
-   **src/FtelMap.Core** - Domain entities, interfaces, business logic
-   **src/FtelMap.Application** - Application services, DTOs, use cases
-   **src/FtelMap.Infrastructure** - Data access, external services, implementations
-   **src/FtelMap.Api** - REST API, controllers, middleware
-   **tests/** - Unit and integration tests

## Essential Commands

```bash
# Build the solution
dotnet build

# Run the API
cd src/FtelMap.Api
dotnet run

# Run with watch (hot reload)
dotnet watch run

# Create EF migrations
dotnet ef migrations add <MigrationName> -p src/FtelMap.Infrastructure -s src/FtelMap.Api

# Update database
dotnet ef database update -p src/FtelMap.Infrastructure -s src/FtelMap.Api

# Run tests
dotnet test

# Run specific test
dotnet test --filter "FullyQualifiedName~TestClassName"

# Docker commands
docker-compose up -d
docker-compose down
```

## Architecture Overview

-   **Clean Architecture** with Domain-Driven Design principles
-   **Repository Pattern** with Unit of Work for data access
-   **Entity Framework Core 9** with SQL Server
-   **Dependency Injection** configured in Infrastructure layer
-   **Docker** support with multi-stage builds
-   **Integration Tests** with TestContainers for isolated testing

## Database Configuration

-   Connection string in appsettings.json
-   Automatic migrations in Development environment
-   Soft delete pattern implemented
-   Audit fields (CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)

## API Endpoints

-   **/api/health** - Health check endpoint
-   **/api/projects** - Projects CRUD operations
-   Swagger UI available at **/swagger** in Development

## Important Notes

-   Entity "Task" is referenced as Core.Entities.Task to avoid conflicts with System.Threading.Tasks.Task
-   CORS configured for React frontend (localhost:5173, localhost:5174)

# .NET General Guidelines

## Development Environment

### Prerequisites

-   .NET 9 SDK
-   Docker and Docker Compose
-   Visual Studio 2022, Visual Studio Code

### Development Best Practices

-   Make small, incremental changes rather than large-scale changes
-   Prefer changing code with less coverage over code with more coverage to avoid breaking existing functionality
-   When implementing new features, write tests before or alongside the implementation (TDD approach)
-   Implement functionalities one at a time, with proper testing
-   Fix one issue at a time, rather than addressing multiple issues simultaneously
-   When dealing with external services, use in-memory implementations during development
-   Document implementation decisions and architecture trade-offs
-   Never comment out functional code just to make tests pass
-   Either fix underlying issues or write proper feature flags/toggles
-   Don't commit temporary workarounds without clear documentation and tracking

## Code Style Guidelines

### Naming Conventions

-   Namespaces: Match directory structure (e.g., `Hypeticker.Core.Markets`)
-   Classes/Methods/Properties: PascalCase
-   Parameters/Local variables: camelCase
-   Private fields: \_camelCase with underscore prefix
-   Interface names: Prefix with 'I' (e.g., `ITrader`)
-   Enum names: PascalCase singular nouns

### Formatting

-   Braces: Allman style (on new lines)
-   Indentation: 4 spaces (not tabs)
-   Max line length: ~120 characters
-   One statement per line
-   One declaration per line

### Type Usage

-   Use decimal data type over lower bit data types for financial values
-   Prefer strong typing over primitive obsession
-   Use IEnumerable<T> for read-only collections
-   Use ICollection<T> or IList<T> for modifiable collections
-   Use Dictionary<TKey, TValue> for key-value collections

### General Conventions

-   Maintain consistency with existing data structures
-   Keep methods focused and small (preferably under 30 lines)
-   Avoid magic numbers; use named constants
-   Use expression-bodied members for simple methods

### Documentation

-   XML comments for all public members
-   Use `<param>`, `<returns>`, and `<exception>` tags appropriately
-   Document non-obvious behavior
-   Include examples for complex APIs

## Architecture Patterns

### General Patterns

-   State pattern with separate state objects for persistence
-   Interface-based design with focused interfaces
-   Factory pattern for object creation
-   Repository pattern for data access
-   Command pattern for order processing
-   Command/Query Responsibility Segregation

### Dependency Injection

-   Use constructor injection for required dependencies
-   Register services in appropriate ServiceCollection extensions
-   Follow ASP.NET Core DI guidelines

### Error Handling

-   Use exceptions for exceptional conditions
-   Return result objects for expected failure cases
-   Null handling: Defensive programming with null checks and null-conditional operators
-   Validate method inputs with guard clauses

### Testing

-   xUnit with descriptive test method names (e.g., "OrderBook_WhenOrderPlaced_ShouldIncreasesBookSize")
-   Multiple assertions per test for related conditions
-   Use mock objects for external dependencies
-   Integration tests for cross-component functionality
-   Run specific focused tests during development: `dotnet test --filter "FullyQualifiedName~=OrderBookTest"`
-   Ensure each component can be tested in isolation

## Code Agent Efficiency Guidelines

### Token Usage Optimization

#### Efficient Tool Usage

-   Use targeted tool calls to check only specific files needed

    ```
    # GOOD: Targeted search
    GrepTool pattern="IUserService" include="*.cs"

    # BAD: Broad search that wastes tokens
    GrepTool pattern="User"
    ```

-   Use BatchTool for multiple operations instead of sequential calls

    ```
    # GOOD: Batched operations
    BatchTool with multiple View operations for related files

    # BAD: Sequential View operations for each file
    ```

-   For complex searches across multiple files, use dispatch_agent:
    ```
    dispatch_agent prompt="Find all implementations of IRepository interface"
    ```

#### File Handling

-   Read only necessary sections of large files:

    ```
    # GOOD: Read specific section
    View file_path="/path/to/large/file.cs" offset=100 limit=50

    # BAD: Read entire large file
    View file_path="/path/to/large/file.cs"
    ```

-   Choose the right search tool:
    -   GlobTool: When searching by filename patterns
    -   GrepTool: When searching by content patterns
    -   LS: When listing directory contents

#### Response Optimization

-   Focus on one issue at a time before proceeding
-   Make smaller, focused code edits instead of large rewrites
-   Skip detailed output analysis in responses
-   Use direct solutions rather than iterative trial-and-error
-   Summarize results briefly instead of analyzing all errors

---

# React Project Guidelines

## Rôle et objectifs

1. Comprendre l’architecture du projet React + Vite et produire du code idiomatique, typé, testé, accessible et performant.
2. Respecter les conventions de structure, nommage, lint, formatage et tests décrites ci-dessous.
3. Avant toute création de code, parcourir vite fait l’existant pour réutiliser composants, hooks, schémas et styles au lieu de dupliquer.
4. À chaque PR générée, fournir en sortie le diff, les tests associés, la checklist de validations et les impacts côté performance, DX et accessibilité.

## Pile technique visée

1. React 19 avec TypeScript, Vite, React Router, React Query pour la donnée distante, Zustand ou Context pour états locaux non triviaux, MUI, Vitest + React Testing Library pour tests, ESLint v9 en flat config et Prettier pour le formatage.
2. Utiliser les transitions et formulaires de React 19 quand pertinent (erreurs/pending/optimistic), et la nouvelle API Metadata pour le SEO lorsque disponible.

## Structure du dépôt

1. `src/app` pour bootstrap (providers, router, queryClient, theming).
2. `src/pages` pour pages routées.
3. `src/features/<domaine>` pour code orienté domaine : `components`, `api`, `hooks`, `types`, `models`, `routes`.
4. `src/components` pour composants UI transverses.
5. `src/shared` pour utilitaires, constantes, hocs, libs de date/formatage.
6. `src/styles` pour styles globaux, tokens.
7. `src/test` pour helpers de test (render personnalisé avec providers).
8. `public` exclusivement pour assets statiques servis tels quels.

## Règles de code et de typage

1. TypeScript strict activé. Aucun `any` implicite. Préférer types dérivés (ReturnType, Parameters) et schémas Zod/Yup côté I/O.
2. Composants fonctionnels, props typées, éviter l’état dérivé de props quand calculable.
3. Hooks personnalisés pour logique réutilisable; pas d’effets pour de la simple dérivation.
4. Nommer les hooks `useX`, composants `PascalCase`, fichiers `kebab-case.tsx`.
5. Éviter les `default export` sauf pages; préférer `named exports` pour une meilleure DX.
6. UI pure → composants; effets réseau/cache → hooks + React Query; gestion locale complexe → Zustand ou reducer.
7. Formulaires avec libs légères (React Hook Form) et validation schema-first.
8. Accessibilité: labels explicites, rôles ARIA uniquement si nécessaires, focus management correct, tests axe si le repo les inclut.

## Données, appels réseau et erreurs

1. Créer un client HTTP unique (fetch ou axios) avec intercepteurs pour auth/erreurs.
2. Côté serveur distant, React Query gère cache, retry, invalidations et états de chargement/erreur.
3. Utiliser les transitions async de React 19 pour UX non bloquante sur interactions coûteuses; pour formulaires, utiliser l’API forms/optimistic de React 19.
4. Centraliser la stratégie d’erreurs: toasts non bloquants, boundary d’erreurs par page, logs structurés.

## Navigation et metadata

1. React Router pour le routing, data-loading si adopté par le repo, et code-splitting par route.
2. Metadata document (titre, description, meta) via l’API React 19 dédiée lorsque disponible; sinon utilitaire centralisé.

## Styles et UI

1. Respecter le système de design du repo (MUI theme).
2. Styles colocalisés avec les composants quand spécifiques; styles globaux dans `src/styles`.
3. Éviter l’inlining de styles complexes; préférer classes utilitaires ou styled API.

## Performance et bundle

1. Code splitting par route et par composant lourd; importer dynamiquement les dépendances volumineuses.
2. Mémoïsation ciblée (`useMemo`/`useCallback`) sur chemins chauds uniquement.
3. Suspense pour data-fetching si le repo l’active, sinon fallback contrôlé.
4. Audit régulier du bundle et des dépendances; préférer petites libs utilitaires et API Web natives.

## Tests

1. Vitest + React Testing Library. Tester le comportement utilisateur et les contrats publics, pas les détails d’implémentation.
2. Un composant ou hook nouveau doit arriver avec tests.
3. Tests d’intégration niveau page pour flux critiques; mocks réseau via MSW quand disponible.
4. Règles de nommage: `*.test.ts(x)` à côté du fichier testé.
5. Setup test partagé dans `src/test`. Réutiliser un `render` custom qui wrappe providers (Router, QueryClient, Theme).
6. Pour formulaires et transitions, tester les états pending/optimistic/erreur.

## ESLint, Prettier et qualité

1. ESLint v9 en flat config (`eslint.config.js` ou `.mjs`), intégrant `@typescript-eslint` et règles React.
2. Prettier pour la forme; eslint-plugin-unused-imports et import-sort si le repo le souhaite.
3. Scripts `lint`, `lint:fix`, `typecheck`, `test`, `test:watch`, `preview`.
4. Husky + lint-staged optionnels pour pre-commit rapides (format/lint ciblé).

## Conventions de PR

1. Inclure description claire, contexte, captures si UI, checklist rapide (tests passent, lint ok, types ok, perf inchangée ou meilleure, a11y vérifiée).
2. Petites PRs focalisées. Mentionner les alternatives envisagées et pourquoi elles ont été écartées.
3. Interdire le code mort et les TODO sans ticket associé.

## Processus attendu pour une nouvelle feature

1. Lire l’existant: rechercher composants/hook/endpoint similaires et patterns établis.
2. Définir l’API de la feature: types, contrats, states.
3. Créer squelette page/route si nécessaire; découper en composants et hooks réutilisables.
4. Implémenter avec React Query pour I/O, formulaires avec validation schema-first, transitions pour interactions coûteuses.
5. Ajouter tests (unitaire + intégration) en ciblant comportements et scénarios d’erreur.
6. Vérifier a11y, perfs (lazy, memo, split), et metadata.
7. Mettre à jour la doc développeur si un pattern ou utilitaire transverse a été introduit.

## Ce que tu dois refuser ou signaler

1. Ajout d’une lib lourde alors qu’une alternative native existe.
2. Hook qui réalise des effets non idempotents ou mélange logique UI et data-fetch.
3. Composant sans accessibilité de base (label, focus, rôle mal utilisé).
4. Tests qui figent des détails internes au lieu du comportement.
5. Ignorer les erreurs réseau ou masquer silencieusement des échecs.

## Sorties attendues par défaut

1. Fichiers créés/modifiés complets et auto-contenus.
2. Bloc de commandes à exécuter pour installer dépendances ou migrer la config.
3. Résumé des risques, limites, dettes techniques et pistes d’amélioration.
4. Lignes directrices pour l’observabilité si pertinent (logs structurés, traces).

## Configuration du Puppeteer MCP

-   Lance toujours le navigateur avec l'argument "args: ["--start-maximized"]" et en 1920x1080

### Important Instructions for Claude

-   **ALWAYS USE pnpm** instead of npm or yarn for all frontend operations
-   **ALWAYS** run `pnpm run lint` AND `pnpm run format` in the sdia-client directory after making any changes to TypeScript/React files
-   If linting errors are found, fix them immediately before proceeding
-   The commands to run after any frontend modification:
    ```bash
    cd sdia-client && pnpm run lint && pnpm run format
    ```
-   **ALWAYS** run puppeteer-navigate with the argument "args: ["--start-maximized"]" and with the resolution 1920x1080
-   If you can, **ALWAYS** implement features on the backend so that computations are handled by the server rather than the client
