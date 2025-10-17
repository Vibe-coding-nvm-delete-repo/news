export type SystemLogicStepStatus =
  | 'pending'
  | 'in-progress'
  | 'success'
  | 'error';

export type SystemLogicStepId =
  | 'validate-config'
  | 'compose-prompt'
  | 'call-openrouter'
  | 'read-response'
  | 'parse-json'
  | 'build-cards'
  | 'store-cards';

export interface SystemLogicStep {
  id: SystemLogicStepId;
  label: string;
  description: string;
  status: SystemLogicStepStatus;
  detail?: string;
  startedAt?: number;
  endedAt?: number;
  elapsedMs?: number;
}

interface StepDefinition {
  id: SystemLogicStepId;
  label: string;
  description: string;
}

export const SYSTEM_LOGIC_DEFINITIONS: StepDefinition[] = [
  {
    id: 'validate-config',
    label: 'Validate Configuration',
    description:
      'Confirm API key, selected model, and keyword are present before launching search.',
  },
  {
    id: 'compose-prompt',
    label: 'Compose Prompt Payload',
    description:
      'Combine search instructions, keyword text, and normalized model parameters.',
  },
  {
    id: 'call-openrouter',
    label: 'POST OpenRouter Chat Completions',
    description:
      'POST https://openrouter.ai/api/v1/chat/completions with composed payload.',
  },
  {
    id: 'read-response',
    label: 'Read OpenRouter Response',
    description:
      'Aggregate streamed text, surface API errors, and capture token usage metadata.',
  },
  {
    id: 'parse-json',
    label: 'Parse Stories JSON',
    description:
      'Parse AI response JSON and ensure a stories array exists before continuing.',
  },
  {
    id: 'build-cards',
    label: 'Materialize Cards',
    description:
      'Transform parsed stories into NewsForge cards with categories and metadata.',
  },
  {
    id: 'store-cards',
    label: 'Persist & Update State',
    description:
      'Add cards to active deck and update cost + progress counters in the store.',
  },
];

export const createInitialSystemLogicSteps = (): SystemLogicStep[] =>
  SYSTEM_LOGIC_DEFINITIONS.map(step => ({
    ...step,
    status: 'pending' as SystemLogicStepStatus,
  }));
