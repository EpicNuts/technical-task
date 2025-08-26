# Thomann's CableGuy Technical Challenge

This repository contains automated end-to-end tests for the Thomann CableGuy page using [Playwright](https://playwright.dev/).

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup

```bash
npm install
npx playwright install
```

## Running Tests

```bash
npm run test
```

## Running Multiple Test Iterations

To repeat the test scenario multiple times (useful for catching flaky tests):

```bash
npx playwright test --repeat-each=5
```

## Test Flow Overview

The main test (`tests/cable-guy-page.spec.ts`) covers:
- Cable type and cable selection (beginning and end)
- Manufacturer filtering and product validation
- Product detail page verification
- Adding the selected product to the basket
- Verifying the basket notification popup

All test logic is modularized in the `pages/CableGuyPage.ts` page object for maintainability.

## Folder Structure

- `pages/` - Page objects and helpers
- `tests/` - Playwright test files
- `playwright-report/` - Playwright test reports
- `playwright.config.ts` - Playwright configuration

## Useful Commands

- Run all tests: `npx playwright test`
- Run a specific test: `npx playwright test tests/cable-guy-page.spec.ts`
- View test report: `npx playwright show-report`
- Install browsers: `npx playwright install`
- Repeat tests: `npx playwright test --repeat-each=5`

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Thomann CableGuy page](https://www.thomann.de/intl/cableguy.html)

---

Feel free to contribute or raise issues!