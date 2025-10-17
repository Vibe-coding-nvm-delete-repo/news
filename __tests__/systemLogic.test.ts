import { SYSTEM_LOGIC_DEFINITIONS } from '@/lib/systemLogic';

describe('SYSTEM_LOGIC_DEFINITIONS', () => {
  it("describes 'read-response' as aggregating streamed text", () => {
    const readResponseStep = SYSTEM_LOGIC_DEFINITIONS.find(
      step => step.id === 'read-response'
    );

    expect(readResponseStep).toBeDefined();
    expect(readResponseStep?.description).toContain('streamed text');
    expect(readResponseStep?.description).not.toMatch(/json/i);
  });
});
