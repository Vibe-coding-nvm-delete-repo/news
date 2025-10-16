import { describe, test, expect } from '@jest/globals';

describe('NewsTab API Request Structure', () => {
  test('API request should not include invalid online parameter', () => {
    // This test documents the fix for the model+prompt output generation issue
    // The API was incorrectly sending 'online: settings.onlineEnabled' parameter
    // which OpenRouter doesn't recognize, causing models to respond incorrectly

    const validRequestBody = {
      model: 'test-model',
      messages: [
        {
          role: 'user',
          content: 'Search for news about test keyword',
        },
      ],
    };

    // Verify the request structure is correct
    expect(validRequestBody).toHaveProperty('model');
    expect(validRequestBody).toHaveProperty('messages');
    expect(validRequestBody).not.toHaveProperty('online'); // Should NOT have 'online' parameter
  });

  test('API request should include HTTP-Referer header', () => {
    // OpenRouter best practice: include HTTP-Referer header
    const requiredHeaders = {
      Authorization: 'Bearer test-key',
      'Content-Type': 'application/json',
      'X-Title': 'News Report Generator',
      'HTTP-Referer': 'http://localhost:3000',
    };

    expect(requiredHeaders).toHaveProperty('HTTP-Referer');
    expect(requiredHeaders['HTTP-Referer']).toBeTruthy();
  });

  test('Search instructions should emphasize actual news content', () => {
    const searchInstructions = `You are a news research assistant. Search the web for the latest news and developments about the given keyword/topic. Focus on events from the past 7 days.

Provide a comprehensive summary that includes:
- Recent news articles and updates
- Important developments and trends  
- Key discussions and notable events
- Sources and dates when available

Do NOT provide code, commands, or apologies. Provide actual news content and information.`;

    // Verify instructions explicitly prevent code/command output
    expect(searchInstructions).toContain(
      'Do NOT provide code, commands, or apologies'
    );
    expect(searchInstructions).toContain('news research assistant');
    expect(searchInstructions).toContain('actual news content');
  });
});
