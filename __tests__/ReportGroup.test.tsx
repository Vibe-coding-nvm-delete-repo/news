import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportGroup from '@/components/ReportGroup';

describe('ReportGroup', () => {
  const mockProps = {
    reportId: 'report-123',
    generatedAt: '2025-10-16T14:30:00Z',
    keywords: ['AI', 'Machine Learning', 'Technology'],
    cardCount: 5,
    cost: 0.1234,
  };

  beforeAll(() => {
    // Mock Date.prototype methods to ensure consistent test output
    jest
      .spyOn(Date.prototype, 'toLocaleDateString')
      .mockImplementation(function (this: Date, locale, options) {
        if (this.toISOString() === '2025-10-16T14:30:00.000Z') {
          return 'Oct 16, 2025';
        }
        return 'Mock Date';
      });

    jest
      .spyOn(Date.prototype, 'toLocaleTimeString')
      .mockImplementation(function (this: Date, locale, options) {
        if (this.toISOString() === '2025-10-16T14:30:00.000Z') {
          return '02:30 PM';
        }
        return 'Mock Time';
      });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders formatted date', () => {
    render(<ReportGroup {...mockProps} />);
    expect(screen.getByText('Oct 16, 2025')).toBeInTheDocument();
  });

  it('renders formatted time', () => {
    render(<ReportGroup {...mockProps} />);
    expect(screen.getByText('02:30 PM')).toBeInTheDocument();
  });

  it('renders keywords as comma-separated list', () => {
    render(<ReportGroup {...mockProps} />);
    expect(
      screen.getByText('AI, Machine Learning, Technology')
    ).toBeInTheDocument();
  });

  it('renders single card count with singular form', () => {
    render(<ReportGroup {...mockProps} cardCount={1} />);
    expect(screen.getByText('1 card')).toBeInTheDocument();
  });

  it('renders multiple card count with plural form', () => {
    render(<ReportGroup {...mockProps} cardCount={5} />);
    expect(screen.getByText('5 cards')).toBeInTheDocument();
  });

  it('renders zero card count with plural form', () => {
    render(<ReportGroup {...mockProps} cardCount={0} />);
    expect(screen.getByText('0 cards')).toBeInTheDocument();
  });

  it('renders cost when provided', () => {
    render(<ReportGroup {...mockProps} cost={0.1234} />);
    expect(screen.getByText('$0.1234')).toBeInTheDocument();
  });

  it('formats cost to 4 decimal places', () => {
    render(<ReportGroup {...mockProps} cost={0.5} />);
    expect(screen.getByText('$0.5000')).toBeInTheDocument();
  });

  it('does not render cost section when cost is undefined', () => {
    const { container } = render(
      <ReportGroup {...mockProps} cost={undefined} />
    );
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });

  it('does not render cost section when cost is not provided', () => {
    const { reportId, generatedAt, keywords, cardCount } = mockProps;
    const { container } = render(
      <ReportGroup
        reportId={reportId}
        generatedAt={generatedAt}
        keywords={keywords}
        cardCount={cardCount}
      />
    );
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });

  it('renders with single keyword', () => {
    render(<ReportGroup {...mockProps} keywords={['Technology']} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('handles large card counts', () => {
    render(<ReportGroup {...mockProps} cardCount={999} />);
    expect(screen.getByText('999 cards')).toBeInTheDocument();
  });

  it('handles high cost values', () => {
    render(<ReportGroup {...mockProps} cost={123.4567} />);
    expect(screen.getByText('$123.4567')).toBeInTheDocument();
  });

  it('handles very small cost values', () => {
    render(<ReportGroup {...mockProps} cost={0.0001} />);
    expect(screen.getByText('$0.0001')).toBeInTheDocument();
  });

  it('renders all icons correctly', () => {
    const { container } = render(<ReportGroup {...mockProps} />);
    // Icons are rendered as SVG elements
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
