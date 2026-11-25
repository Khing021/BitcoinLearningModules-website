import { describe, it, expect } from 'vitest';
import { calculateOutcomeBreakdown } from '../src/lib/outcomes';
import type { Unit } from '../src/lib/contracts';

describe('calculateOutcomeBreakdown', () => {
  it('returns 0 points and 0% when no units are selected', () => {
    const summary = calculateOutcomeBreakdown([]);
    expect(summary.totalPoints).toBe(0);
    expect(summary.items).toHaveLength(5);
    for (const item of summary.items) {
      expect(item.rawPoints).toBe(0);
      expect(item.percentage).toBe(0);
    }
  });

  it('aggregates raw points and normalizes percentages accurately for single unit', () => {
    const mockUnits: Unit[] = [
      {
        unitId: 'unit-1',
        sequence: 1,
        title: 'Unit 1',
        durationMinutes: 3,
        classPath: 'u1/class.html',
        guidePath: 'u1/guide.html',
        eoWeights: { EO1: 6, EO2: 4 }
      }
    ];

    const summary = calculateOutcomeBreakdown(mockUnits);
    expect(summary.totalPoints).toBe(10);

    const eo1 = summary.items.find(i => i.outcome.id === 'EO1');
    const eo2 = summary.items.find(i => i.outcome.id === 'EO2');
    const eo3 = summary.items.find(i => i.outcome.id === 'EO3');

    expect(eo1?.rawPoints).toBe(6);
    expect(eo1?.percentage).toBe(60);

    expect(eo2?.rawPoints).toBe(4);
    expect(eo2?.percentage).toBe(40);

    expect(eo3?.rawPoints).toBe(0);
    expect(eo3?.percentage).toBe(0);
  });

  it('aggregates multiple units across all 5 EOs correctly', () => {
    const mockUnits: Unit[] = [
      {
        unitId: 'unit-a',
        sequence: 1,
        title: 'Unit A',
        durationMinutes: 3,
        classPath: 'a/class.html',
        guidePath: 'a/guide.html',
        eoWeights: { EO1: 3, EO2: 1 }
      },
      {
        unitId: 'unit-b',
        sequence: 2,
        title: 'Unit B',
        durationMinutes: 6,
        classPath: 'b/class.html',
        guidePath: 'b/guide.html',
        eoWeights: { EO3: 3, EO4: 2, EO5: 1 }
      }
    ];

    const summary = calculateOutcomeBreakdown(mockUnits);
    expect(summary.totalPoints).toBe(10); // 3 + 1 + 3 + 2 + 1 = 10

    const map = Object.fromEntries(summary.items.map(i => [i.outcome.id, i.percentage]));
    expect(map.EO1).toBe(30);
    expect(map.EO2).toBe(10);
    expect(map.EO3).toBe(30);
    expect(map.EO4).toBe(20);
    expect(map.EO5).toBe(10);
  });
});
