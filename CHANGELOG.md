# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2024-12-09

### Added

- setting up ci publish

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

[1.0.3]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.3
[1.0.2]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.2
[1.0.1]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.1
[1.0.0]: https://github.com/ScriptAlchemist/react-discriminated-union-context/releases/tag/v1.0.0
