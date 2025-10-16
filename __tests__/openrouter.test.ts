import { normalizeModelParameters } from '@/lib/openrouter';
import { ModelParameters } from '@/lib/store';

describe('normalizeModelParameters', () => {
  it('returns empty object when parameters are undefined', () => {
    expect(normalizeModelParameters(undefined)).toEqual({});
    expect(normalizeModelParameters(null)).toEqual({});
  });

  it('filters out undefined values', () => {
    const params: ModelParameters = {
      temperature: 0.5,
      max_tokens: undefined,
      top_p: 0.9,
    };

    expect(normalizeModelParameters(params)).toEqual({
      temperature: 0.5,
      top_p: 0.9,
    });
  });

  it('converts response_format json_object into object syntax', () => {
    const params: ModelParameters = {
      response_format: 'json_object',
      temperature: 0.2,
    };

    expect(normalizeModelParameters(params)).toEqual({
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
  });

  it('omits response_format when set to auto or text', () => {
    const autoParams: ModelParameters = {
      response_format: 'auto',
      temperature: 0.1,
    };

    const textParams: ModelParameters = {
      response_format: 'text',
      presence_penalty: 0.3,
    };

    expect(normalizeModelParameters(autoParams)).toEqual({ temperature: 0.1 });
    expect(normalizeModelParameters(textParams)).toEqual({
      presence_penalty: 0.3,
    });
  });

  it('drops reasoning parameters for non-reasoning models', () => {
    const params: ModelParameters = {
      reasoning: 'high',
      include_reasoning: true,
      temperature: 0.2,
    };

    expect(
      normalizeModelParameters(params, 'openai/gpt-4o-mini:online')
    ).toEqual({
      temperature: 0.2,
    });
  });

  it('converts reasoning parameters for reasoning-capable models', () => {
    const params: ModelParameters = {
      reasoning: 'medium',
      include_reasoning: true,
      stop: ['  END  ', '', 'DONE'],
    };

    expect(normalizeModelParameters(params, 'openai/o1-mini:online')).toEqual({
      reasoning: { effort: 'medium' },
      include_reasoning: true,
      stop: ['END', 'DONE'],
    });
  });
});
