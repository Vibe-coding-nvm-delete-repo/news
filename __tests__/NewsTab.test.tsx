import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsTab from '@/components/NewsTab';

// Mock zustand store
jest.mock('@/lib/store', () => ({
  useStore: () => ({
    settings: {
      keywords: [
        { text: 'AI', enabled: true },
        { text: 'Technology', enabled: false },
      ],
      apiKey: 'test-key',
      selectedModel: 'test-model',
      searchInstructions: 'Test instructions',
      formatPrompt: 'Test prompt',
      onlineEnabled: false,
    },
    models: [
      {
        id: 'test-model',
        name: 'Test Model',
        totalCostPer1M: 1.0,
        pricing: {
          prompt: 0.5,
          completion: 0.5,
        },
      },
    ],
  }),
}));

describe('NewsTab Component', () => {
  it('renders without crashing (smoke test for syntax errors)', () => {
    // This test ensures the component can be parsed and rendered
    // It would catch syntax errors like the malformed promise chain that was fixed
    const { container } = render(<NewsTab />);
    expect(container).toBeInTheDocument();
  });

  it('displays generate report button', () => {
    const { getByText } = render(<NewsTab />);
    expect(getByText('Generate Report')).toBeInTheDocument();
  });

  it('shows enabled keywords count', () => {
    const { getByText } = render(<NewsTab />);
    expect(getByText('1 keywords enabled')).toBeInTheDocument();
  });

  it('displays estimated cost', () => {
    const { getByText } = render(<NewsTab />);
    expect(getByText(/Estimated Cost:/)).toBeInTheDocument();
  });
});
