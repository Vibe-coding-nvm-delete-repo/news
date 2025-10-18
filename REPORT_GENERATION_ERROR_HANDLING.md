# Report Generation Error Handling Guide

This document describes the robust error handling mechanisms implemented in the report generation flow to help users understand and resolve issues quickly.

## Overview

The report generation flow includes comprehensive error handling with:

- **Global 30-second timeout** with automatic reset
- **Detailed error messages** showing exact failure points
- **Step-by-step tracking** of the generation process
- **Actionable suggestions** for resolving issues
- **Automatic cleanup** and state reset on errors

## Global Timeout Mechanism

### What It Does

When you click "Generate Report", the system sets a 30-second global timeout. If the generation process takes longer than 30 seconds without completing, the system automatically:

1. **Stops all processing** - Aborts ongoing API requests
2. **Resets all state** - Clears progress indicators and intermediate results
3. **Shows a detailed error message** - Explains what happened and why
4. **Provides suggestions** - Gives actionable steps to resolve the issue

### Why 30 Seconds?

The 30-second timeout is designed to catch scenarios where:

- API requests are hanging indefinitely
- Network connectivity is poor
- Models are taking too long to respond
- The system is stuck in an error state

Individual keyword searches already have their own 20-second timeouts, so the 30-second global timeout serves as a safety net.

### Timeout Error Message

When a timeout occurs, you'll see a red banner with:

```
⏱️ Generation timeout after 30 seconds!

📊 Status: X/Y keywords processed
📦 Cards generated: N

🔍 Issue: The system took too long to generate outputs. This could be due to:
• Slow API responses from OpenRouter
• Network connectivity issues
• Model taking too long to search and respond

💡 Suggestions:
• Try again with fewer keywords
• Check your internet connection
• Try a different model
• Review individual keyword results above for specific errors
```

## Enhanced Error Messages

All error messages now follow a consistent, detailed format to help you understand exactly where and why something went wrong.

### Error Message Format

Every error message includes:

1. **🚫 Step**: Which step in the process failed
2. **❌ Failure Point**: The exact location of the failure
3. **📍 Location**: Additional context about what was happening
4. **Error**: The actual error message
5. **💡 Suggestions**: Actionable steps to fix the problem

### Step-by-Step Tracking

The report generation process is tracked through these steps:

1. **Validate Configuration** - Check API key, model, and keywords
2. **Compose Prompt Payload** - Combine search instructions with keywords
3. **POST OpenRouter Chat Completions** - Send request to API
4. **Read OpenRouter Response** - Receive and parse API response
5. **Parse Stories JSON** - Convert response to structured data
6. **Materialize Cards** - Transform stories into news cards
7. **Persist & Update State** - Save cards and update UI

Each step is tracked and displayed in real-time in the UI when you expand a keyword result.

## Common Error Scenarios

### 1. HTTP Request Failures

**Symptoms**: Error during "POST OpenRouter Chat Completions" step

**Common Causes**:

- Invalid API key (HTTP 401)
- Rate limit exceeded (HTTP 429)
- Model not available (HTTP 404)
- Server error (HTTP 500+)

**Error Message Example**:

```
🚫 Step: POST OpenRouter Chat Completions
❌ Failure Point: HTTP 401 Unauthorized
📍 Location: OpenRouter API Request

Error: Invalid authentication credentials

💡 Common causes:
• Invalid API key (401)
• Rate limit exceeded (429)
• Model not available (404)
• Server error (500+)

💡 Suggestions:
• Verify your API key in Settings
• Check OpenRouter status and billing
• Try a different model
```

### 2. JSON Conversion Errors

**Symptoms**: Error during "Parse Stories JSON" step

**Common Causes**:

- AI returned text that doesn't match conversion instructions
- Field patterns don't match the AI output format
- Story delimiter not found in response

**Error Message Example**:

```
🚫 Step: Parse Stories JSON
❌ Failure Point: Text-to-JSON Conversion
📍 Location: Converting AI response to structured stories

Error: No stories were detected using the JSON conversion instructions.

🔍 AI Response Preview:
[First 300 characters of the AI response]

💡 This means:
• The AI returned text that doesn't match your conversion instructions
• No story segments were detected using your delimiter/pattern
• The field patterns don't match the AI output format

💡 Suggestions:
• Check browser console (F12) for full AI response
• Update JSON conversion instructions to match AI output format
• Try using simpler/clearer search instructions
• Consider using a different model
```

### 3. Missing Fields Object

**Symptoms**: Error during JSON conversion configuration validation

**Cause**: Your JSON conversion instructions don't include a "fields" object

**Error Message Example**:

```
🚫 Step: Parse Stories JSON
❌ Failure Point: JSON Conversion Configuration Validation
📍 Location: Settings > JSON Conversion Instructions

Error: JSON conversion instructions must include a fields object.

💡 Fix: Ensure your JSON conversion instructions:
• Are valid JSON format
• Include a "fields" object
• Define at least one field with pattern
• Example: { "fields": { "title": { "pattern": "Title: (.+)" } } }
```

### 4. Missing Stories Array

**Symptoms**: Conversion succeeded but no stories array in result

**Cause**: The conversion produced valid JSON but not in the expected format

**Error Message Example**:

```
🚫 Step: Parse Stories JSON
❌ Failure Point: Stories Array Validation
📍 Location: Validating converted JSON structure

Error: Missing or invalid 'stories' array in converted JSON

🔍 Converted JSON Preview:
[First 300 characters of the converted JSON]

💡 Expected format:
{
  "stories": [
    { "title": "...", "summary": "...", ... },
    ...
  ]
}

💡 This means:
• The conversion succeeded but didn't produce a "stories" array
• Your conversion instructions may need adjustment
• The AI response format may not match expectations

💡 Suggestions:
• Check browser console (F12) for full details
• Verify your JSON conversion instructions produce a stories array
• Try adjusting story delimiter or pattern settings
```

## Debugging Tips

### 1. Check Browser Console

Press **F12** to open the browser console. All detailed logs are written there, including:

- Full API responses
- Conversion attempts and results
- Timing information
- Error stack traces

### 2. Review System Logic Steps

When you expand a keyword result, you can see the detailed step-by-step execution:

- Which steps succeeded (green checkmarks)
- Which step failed (red X)
- Timing information for each step
- Detailed error messages

### 3. Examine AI Response

For conversion errors, the error message includes a preview of the AI response. Check if:

- The AI returned the expected format
- The response matches your conversion instructions
- There's actually content in the response

### 4. Test with Fewer Keywords

If you're experiencing timeouts or errors:

- Try generating with just 1-2 keywords first
- This helps isolate whether the issue is keyword-specific or systematic
- Once working, gradually add more keywords

### 5. Try a Different Model

Different models have different characteristics:

- Some models are faster but less accurate
- Some models are better at following specific formats
- Some models handle web searches better

## Stop & Reset Button

While generation is running, you can manually stop the process at any time:

1. Click the **"Stop & Reset"** button (red button next to "Generate Report")
2. The system will:
   - Abort all ongoing API requests
   - Clear the global timeout
   - Reset all generation state
   - Clear progress indicators
3. You can then make adjustments and try again

## Validation Before Generation

Before starting generation, the system validates:

✅ At least one keyword is enabled
✅ API key is configured
✅ A model is selected
✅ JSON conversion instructions are valid
✅ Fields object exists in conversion instructions
✅ At least one field is defined

If any validation fails, you'll see an alert explaining what needs to be fixed.

## Best Practices

### 1. Configure Settings Carefully

- Test your JSON conversion instructions with a simple example first
- Use clear, specific search instructions
- Select an appropriate model for your use case

### 2. Monitor Progress

- Watch the real-time progress indicators
- Expand keyword results to see detailed step tracking
- Check for patterns in errors across multiple keywords

### 3. Incremental Testing

- Start with 1-2 keywords to test your configuration
- Once working reliably, add more keywords
- If errors occur, reduce keyword count to isolate the issue

### 4. Review Error Messages Carefully

- Error messages include specific suggestions
- Check the "Failure Point" to understand exactly what went wrong
- Follow the suggestions in order

### 5. Use Browser Console

- Keep the console open (F12) during generation
- Look for additional context in console logs
- Copy full error messages for troubleshooting

## Technical Implementation

For developers interested in the implementation details:

### Files Modified

- `components/NewsTab.tsx` - Main report generation logic with timeout and error handling
- `lib/textConversion.ts` - JSON conversion validation (already had fields validation)

### Key Features

1. **Global Timeout**: Uses `setTimeout` with 30-second delay, cleared on successful completion
2. **Error Enhancement**: All catch blocks now construct detailed, formatted error messages
3. **State Management**: Comprehensive state reset via `stopAndReset` function
4. **UI Feedback**: Error banner component with dismissible interface

### Testing

- 247 tests covering all functionality
- 9 new tests specifically for timeout and error handling
- All tests pass with no regressions

## Related Documentation

- [README.md](README.md) - Quick start and basic usage
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup
- [docs/API.md](docs/API.md) - OpenRouter API integration details

## Questions or Issues?

If you encounter errors not covered in this guide:

1. Check the browser console for full error details
2. Review the error message suggestions
3. Try the debugging tips above
4. Open an issue on GitHub with the full error message and console logs
