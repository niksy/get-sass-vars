# Changelog

## [Unreleased][]

## [4.0.1][] - 2023-10-29

### Fixed

-   Properly escape quotes for string values
    ([#11](https://github.com/niksy/get-sass-vars/issues/11))

## [4.0.0][] - 2023-06-13

### Changed

-   Use [new Sass API](https://sass-lang.com/documentation/js-api)

### Removed

-   **Node 10 support, lowest version is 12.22**
-   **Legacy Sass support, lowest version is 1.45**
-   Precision option; Dart Sass defaults to a sufficiently high precision for
    all existing browsers

### Fixed

-   ES module import implementation

## [3.4.0][] - 2022-01-11

### Added

-   Sync version ([#6](https://github.com/niksy/get-sass-vars/issues/6))

## [3.3.0][] - 2022-01-11

### Added

-   Precision option ([#5](https://github.com/niksy/get-sass-vars/issues/5))

## [3.2.1][] - 2021-12-03

### Fixed

-   TypeScript definitions
    ([#4](https://github.com/niksy/get-sass-vars/issues/4))

## [3.2.0][] - 2021-11-09

### Added

-   TypeScript types

### Changed

-   Update `postcss-scss`
-   Use GitHub Actions instead of Travis
-   Upgrade package

## [3.1.0][] - 2021-06-01

### Removed

-   Dependency on `node-fibers` (Node 16 compatibility)
    -   You can still pass Fibers implementation through `sassOptions` parameter

## [3.0.1][] - 2021-01-14

### Fixed

-   Properly parse SCSS syntax

## [3.0.0][] - 2021-01-14

### Changed

-   Switch to Dart Sass
-   Upgrade package

### Removed

-   **Node 4 support, lowest version is 10**

<!-- prettier-ignore-start -->

[3.0.0]: https://github.com/niksy/get-sass-vars/tree/v3.0.0
[3.0.1]: https://github.com/niksy/get-sass-vars/tree/v3.0.1
[3.1.0]: https://github.com/niksy/get-sass-vars/tree/v3.1.0
[3.2.0]: https://github.com/niksy/get-sass-vars/tree/v3.2.0
[3.2.1]: https://github.com/niksy/get-sass-vars/tree/v3.2.1
[3.3.0]: https://github.com/niksy/get-sass-vars/tree/v3.3.0
[3.4.0]: https://github.com/niksy/get-sass-vars/tree/v3.4.0
[Unreleased]: https://github.com/niksy/get-sass-vars/compare/v4.0.1...HEAD
[4.0.1]: https://github.com/niksy/get-sass-vars/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/niksy/get-sass-vars/tree/v4.0.0
