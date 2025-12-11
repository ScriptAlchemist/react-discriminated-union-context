# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2025-12-11

### Changed

- Updated npm publish workflow to rely on Trusted Publisher / OIDC instead of a static npm token

## [1.3.0] - 2025-12-10

### Added

- Added comprehensive test suite using Node.js built-in test runner with @testing-library/react (27 tests)
- Tests cover actual React hook behavior with providers, type narrowing, error handling, and different discriminant types
- Added `test` and `test:ci` npm scripts
- Added jsdom setup for React testing environment

### Changed

- Improved IDE autocomplete: narrowed types no longer show hint properties as suggestions
- Fixed `useAuthContext("default")` to return actual property types (`string | undefined`) instead of confusing hint strings
- Added `DeepPrettify` type to recursively expand nested object types in hover display
- Removed `readonly` modifier from optional properties in default return type
- Expanded example app with richer `AuthState` including `authenticating`, `refreshing`, and `locked` states
- Example components now demonstrate all expanded nested types (`User`, `Permissions`, `SessionInfo`)

### Removed

- Removed `NarrowingHint` type (replaced with actual property types)
- Removed `SuggestedKey` and `KeysNotInNarrowed` helper types (no longer needed)

## [1.2.0] - 2025-12-09

### Added

- Added `'default'` option to return the full union type without narrowing (e.g., `useContext('default')`)
- Added helpful TypeScript hints when using `'default'` - hover over properties like `user` or `error` to see hints like `Use useContext("authenticated") to access "user" (requires status="authenticated")`
- Narrowed types (e.g., `useContext("idle")`) show standard "Property does not exist" errors - switch to `'default'` to discover which variant has the property you need

### Changed

- **BREAKING:** Removed `defaultValue` parameter from `createDiscriminatedContext` - no longer needed
- **BREAKING:** `useContext` hook now requires a discriminant value parameter - calling without arguments (`useContext()`) is no longer allowed
- `useContext` now throws an error if called outside of a Provider
- TypeScript will show available discriminant values (including `'default'`) when typing the parameter
- Runtime validation always checks that the expected value matches the actual discriminant (except for `'default'`)
- Updated README and example components to reflect new API

## [1.1.8] - 2024-12-09

### Added

- Added `.rules` file with project workflow guidelines
- Documented branching strategy, changelog updates, and version bumping requirements

## [1.0.8] - 2024-12-09

### Changed

- Updated README with correct package name
- Added example application documentation with setup instructions
- Added example structure and key patterns sections
- Clarified React 19 support in requirements

## [1.0.7] - 2024-12-09

### Changed

- Refactored example app components into separate files
- Added components directory with AuthStatus, UserProfile, and ErrorDisplay
- Created shared authContext module for context and types

## [1.0.6] - 2024-12-09

### Added

- Example React application demonstrating library usage
- Interactive demo with authentication state machine
- Example README with setup instructions

## [1.0.5] - 2024-12-09

### Changed

- Auto-publish to npm on merge to main (instead of requiring manual GitHub Release)

## [1.0.4] - 2024-12-09

### Changed

- Setting up CI publish workflow

## [1.0.3] - 2024-12-09

### Added

- GitHub Actions workflow for automated npm publishing on release
- GitHub Actions CI workflow to enforce version bump and changelog updates on PRs
- Typecheck and build validation in CI

## [1.0.2] - 2024-12-09

### Changed

- Added CHANGELOG.md to track version history

## [1.0.1] - 2024-12-09

### Changed

- Added repository and author to package.json

## [1.0.0] - 2024-12-09

### Added

- `createDiscriminatedContext` function for creating type-safe React contexts with discriminated unions
- `DiscriminantValues` utility type for extracting discriminant values from union types
- Full TypeScript support with automatic type narrowing when specifying expected discriminant values
- Runtime validation that throws an error when expected discriminant doesn't match actual value
- ESM-only build output
- Support for React 18 and React 19

[1.3.1]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.3.1
[1.3.0]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.3.0
[1.2.0]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.2.0
[1.1.8]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.1.8
[1.0.8]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.8
[1.0.7]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.7
[1.0.6]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.6
[1.0.5]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.5
[1.0.4]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.4
[1.0.3]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.3
[1.0.2]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.2
[1.0.1]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.1
[1.0.0]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.0
