## Changelog

### 2025-10-18

- feature: Added global 30-second timeout mechanism for report generation with automatic reset
- enhancement: Comprehensive error messages showing exact failure points with actionable suggestions
- enhancement: Enhanced all error handling steps (HTTP, API, JSON conversion, validation) with detailed context
- feature: Global timeout error banner with dismissible UI
- documentation: Added comprehensive Report Generation Error Handling Guide
- testing: Added 9 new tests for timeout and error handling functionality
- All 247 tests passing, type checks and linting pass

### 2025-10-16

- security: Upgraded Next.js to 14.2.33 to address known vulnerabilities (authorization bypass, cache poisoning). All lint, type checks, tests, and production build pass. [Droid-assisted]
