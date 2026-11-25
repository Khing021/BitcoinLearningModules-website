import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OutcomeBreakdown } from '../src/components/OutcomeBreakdown';
import type { Unit } from '../src/lib/contracts';

describe('OutcomeBreakdown Component', () => {
  const sampleUnits: Unit[] = [
    {
      unitId: 'unit-1',
      sequence: 1,
      title: 'เงินคืออะไร',
      durationMinutes: 3,
      classPath: '',
      guidePath: '',
      chapter: 'Chapter 1: Money',
      eoWeights: { EO1: 3 }
    },
    {
      unitId: 'unit-2',
      sequence: 2,
      title: 'บิตคอยน์คืออะไร',
      durationMinutes: 3,
      classPath: '',
      guidePath: '',
      chapter: 'Chapter 3: Bitcoin',
      eoWeights: { EO2: 3 }
    }
  ];

  it('renders progress bar and legend items with percentages', () => {
    render(<OutcomeBreakdown selectedUnits={sampleUnits} />);

    expect(screen.getByText('EO 1')).toBeDefined();
    expect(screen.getByText('EO 2')).toBeDefined();
    expect(screen.getByText('📊 รายละเอียด EO')).toBeDefined();
  });

  it('opens modal with donut chart and table when clicking trigger button', () => {
    render(<OutcomeBreakdown selectedUnits={sampleUnits} />);

    const button = screen.getByRole('button', { name: /รายละเอียด EO/i });
    fireEvent.click(button);

    expect(screen.getByText(/การกระจายน้ำหนักสมรรถนะ/i)).toBeDefined();
    expect(screen.getByText(/ตารางแจกแจงค่าน้ำหนักรายยูนิต/i)).toBeDefined();
    expect(screen.getByText('เงินคืออะไร')).toBeDefined();
    expect(screen.getByText('บิตคอยน์คืออะไร')).toBeDefined();
  });
});
