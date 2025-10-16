export interface JsonConversionFieldInstruction {
  pattern: string;
  flags?: string;
  group?: number;
  fallback?: unknown;
  type?: 'string' | 'number';
  required?: boolean;
  trim?: boolean;
}

export interface JsonConversionStoryPattern {
  pattern: string;
  flags?: string;
  group?: number;
}

export interface JsonConversionInstructions {
  storyDelimiter?: string | JsonConversionStoryPattern;
  storyPattern?: JsonConversionStoryPattern;
  fields: Record<string, JsonConversionFieldInstruction>;
  requiredFields?: string[];
  trimValues?: boolean;
}

export interface ConversionOutcome {
  stories: Array<Record<string, unknown>>;
  rejectedStories: number;
}

const ensureGlobalFlag = (flags?: string) => {
  if (!flags) return 'g';
  return flags.includes('g') ? flags : `${flags}g`;
};

const isStoryPattern = (value: unknown): value is JsonConversionStoryPattern =>
  typeof value === 'object' &&
  value !== null &&
  'pattern' in value &&
  typeof (value as JsonConversionStoryPattern).pattern === 'string';

const extractStorySegments = (
  rawText: string,
  config: JsonConversionInstructions
): string[] => {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  if (config.storyPattern && isStoryPattern(config.storyPattern)) {
    const { pattern, flags, group = 0 } = config.storyPattern;
    let regex: RegExp;
    try {
      regex = new RegExp(pattern, ensureGlobalFlag(flags));
    } catch (error: any) {
      throw new Error(`Invalid storyPattern regex: ${error.message}`);
    }
    const matches = Array.from(trimmed.matchAll(regex));
    return matches
      .map(match => {
        const matchValue = match[group] ?? match[0];
        return typeof matchValue === 'string' ? matchValue.trim() : '';
      })
      .filter(segment => segment.length > 0);
  }

  if (
    typeof config.storyDelimiter === 'string' &&
    config.storyDelimiter.length
  ) {
    return trimmed
      .split(config.storyDelimiter)
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0);
  }

  if (isStoryPattern(config.storyDelimiter)) {
    const delimiter = config.storyDelimiter;
    let regex: RegExp;
    try {
      regex = new RegExp(delimiter.pattern, ensureGlobalFlag(delimiter.flags));
    } catch (error: any) {
      throw new Error(`Invalid storyDelimiter regex: ${error.message}`);
    }
    return trimmed
      .split(regex)
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0);
  }

  return [trimmed];
};

export const parseJsonConversionInstructions = (
  raw: string
): JsonConversionInstructions => {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new Error('JSON conversion instructions cannot be empty.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error: any) {
    throw new Error(
      `Invalid JSON conversion instructions: ${error.message ?? error}`
    );
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('JSON conversion instructions must be a JSON object.');
  }

  const config = parsed as JsonConversionInstructions;
  if (!config.fields || typeof config.fields !== 'object') {
    throw new Error(
      'JSON conversion instructions must include a fields object.'
    );
  }

  if (Object.keys(config.fields).length === 0) {
    throw new Error(
      'JSON conversion instructions must define at least one field.'
    );
  }

  return config;
};

export const convertTextToStories = (
  rawText: string,
  config: JsonConversionInstructions
): ConversionOutcome => {
  if (typeof rawText !== 'string' || rawText.trim().length === 0) {
    throw new Error('OpenRouter returned an empty response to convert.');
  }

  const segments = extractStorySegments(rawText, config);
  if (segments.length === 0) {
    throw new Error(
      'No stories were detected using the JSON conversion instructions.'
    );
  }

  const globalTrim = config.trimValues !== false;
  const requiredFields = new Set<string>([
    ...(config.requiredFields ?? []),
    ...Object.entries(config.fields)
      .filter(([, field]) => field?.required)
      .map(([fieldName]) => fieldName),
  ]);

  let rejectedStories = 0;

  const stories = segments
    .map(segment => {
      const story: Record<string, unknown> = {};
      const missingRequired: string[] = [];

      Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
        if (!fieldConfig || typeof fieldConfig !== 'object') {
          throw new Error(
            `Field configuration for "${fieldName}" must be an object.`
          );
        }

        const {
          pattern,
          flags,
          group = 1,
          fallback,
          type,
          trim,
          required,
        } = fieldConfig;

        if (!pattern || typeof pattern !== 'string') {
          throw new Error(`Field "${fieldName}" is missing a regex pattern.`);
        }

        let regex: RegExp;
        try {
          regex = new RegExp(pattern, flags);
        } catch (regexError: any) {
          throw new Error(
            `Invalid regex for field "${fieldName}": ${regexError.message}`
          );
        }

        const match = regex.exec(segment);
        let value: unknown = match ? match[group] : undefined;

        const shouldTrim = trim ?? globalTrim;
        if (typeof value === 'string' && shouldTrim) {
          value = value.trim();
        }

        const isMissing =
          value === undefined ||
          value === null ||
          (typeof value === 'string' && value.length === 0);

        if (isMissing) {
          if (fallback !== undefined) {
            value = fallback;
          } else if (required || requiredFields.has(fieldName)) {
            missingRequired.push(fieldName);
            return;
          } else {
            value = null;
          }
        }

        if (type === 'number') {
          const numeric =
            typeof value === 'number' ? value : parseFloat(String(value));
          if (Number.isFinite(numeric)) {
            value = Number(numeric);
          } else if (typeof fallback === 'number') {
            value = fallback;
          } else if (
            typeof fallback === 'string' &&
            Number.isFinite(parseFloat(fallback))
          ) {
            value = parseFloat(fallback);
          } else {
            value = 0;
          }
        }

        story[fieldName] = value;
      });

      if (missingRequired.length > 0) {
        rejectedStories += 1;
        return null;
      }

      return story;
    })
    .filter((story): story is Record<string, unknown> => story !== null);

  if (stories.length === 0) {
    throw new Error(
      'Conversion produced zero valid stories. Adjust the conversion instructions or model output format.'
    );
  }

  return { stories, rejectedStories };
};

export const DEFAULT_JSON_CONVERSION_CONFIG: JsonConversionInstructions = {
  storyDelimiter: '\n---\n',
  trimValues: true,
  requiredFields: ['title', 'summary'],
  fields: {
    title: { pattern: '^Title:\\s*(.+)', flags: 'mi', required: true },
    summary: { pattern: '^Summary:\\s*(.+)', flags: 'mi', required: true },
    category: {
      pattern: '^Category:\\s*(.+)',
      flags: 'mi',
      fallback: 'Uncategorized',
    },
    rating: {
      pattern: '^Rating:\\s*(\\d+(?:\\.\\d+)?)',
      flags: 'mi',
      type: 'number',
      fallback: 0,
    },
    source: {
      pattern: '^Source:\\s*(.+)',
      flags: 'mi',
      fallback: null,
    },
    url: { pattern: '^URL:\\s*(.+)', flags: 'mi', fallback: null },
    date: { pattern: '^Date:\\s*(.+)', flags: 'mi', fallback: null },
  },
};

export const DEFAULT_JSON_CONVERSION_INSTRUCTIONS = JSON.stringify(
  DEFAULT_JSON_CONVERSION_CONFIG,
  null,
  2
);
