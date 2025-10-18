# Changelog

### 2025-10-18

- feature: Added global 30-second timeout mechanism for report generation with automatic reset
- enhancement: Comprehensive error messages showing exact failure points with actionable suggestions
- enhancement: Enhanced all error handling steps (HTTP, API, JSON conversion, validation) with detailed context
- feature: Global timeout error banner with dismissible UI
- documentation: Added comprehensive Report Generation Error Handling Guide
- testing: Added 9 new tests for timeout and error handling functionality
- All 247 tests passing, type checks and linting pass

### 2025-10-16

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Comprehensive documentation update to ensure accuracy across all files
- Updated DEPLOYMENT.md to reflect client-side architecture (removed outdated Supabase references)
- Updated CONTRIBUTING.md and DEVELOPMENT.md with accurate script references
- Enhanced README.md with detailed feature descriptions and project structure

### Added

- JSDoc comments to utility modules and components for better IDE support

## [0.1.0] - 2025-10-16

### Security

- Upgraded Next.js to 14.2.33 to address known vulnerabilities (authorization bypass, cache poisoning)
- All lint, type checks, tests, and production build verified passing

### Added

- Interactive Policy Viewer for agent governance documentation
- Model parameter configuration (13+ parameters for AI behavior tuning)
- Parallel keyword search processing for faster report generation
- News card archive/restore functionality
- Date filtering for news cards
- Report history with metadata tracking
- System logic step visualization during generation

### Changed

- Improved UI/UX with responsive design
- Enhanced error handling and validation
- Optimized state management with Zustand persist

### Fixed

- JSON parsing reliability improvements
- Type coercion issues for rating field
- Mobile responsiveness across all components
