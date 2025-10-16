## Changelog

### 2025-10-16

- **fix: Resolved "No Cards Generated" issue by updating default searchInstructions with explicit JSON format specification** [Droid-assisted]
  - Root cause: Default searchInstructions was too vague ("Search for news about the following keyword and provide your findings:")
  - The AI model was completing searches successfully but returning empty stories arrays because it didn't know what format to use
  - Solution: Updated default searchInstructions to include:
    - Explicit JSON schema with all required fields (title, summary, source, url, date, category, rating)
    - Clear rules: rating scale (1-10), minimum 3-5 stories, recent news (past 7 days)
    - Fallback behavior: return {"stories": []} if no news found
  - Impact: Users will now receive properly formatted news stories instead of empty results
  - Note: Existing users with custom searchInstructions will need to manually update their settings or reset to defaults

- security: Upgraded Next.js to 14.2.33 to address known vulnerabilities (authorization bypass, cache poisoning). All lint, type checks, tests, and production build pass. [Droid-assisted]
