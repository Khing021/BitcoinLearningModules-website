import type { ExpectedOutcome, Unit } from './contracts';

export type OutcomeBreakdownItem = {
  outcome: ExpectedOutcome;
  rawPoints: number;
  percentage: number; // 0 to 100, rounded to 1 decimal place
};

export type CurriculumOutcomeSummary = {
  totalPoints: number;
  items: OutcomeBreakdownItem[];
};

export const DEFAULT_EXPECTED_OUTCOMES: ExpectedOutcome[] = [
  {
    id: 'EO1',
    code: 'EO 1',
    title: 'เศรษฐศาสตร์ออสเตรียนและประวัติศาสตร์การเงิน',
    shortTitle: 'เศรษฐศาสตร์ & ประวัติศาสตร์การเงิน',
    description: 'สามารถอธิบายแนวคิดเศรษฐศาสตร์ออสเตรียนขั้นพื้นฐาน เงินมั่นคง และประวัติศาสตร์การเงิน',
    color: '#cf6438'
  },
  {
    id: 'EO2',
    code: 'EO 2',
    title: 'หลักการทำงานและเทคโนโลยีบิตคอยน์',
    shortTitle: 'หลักการ & เทคโนโลยี',
    description: 'สามารถอธิบายหลักการทำงานพื้นฐานเกี่ยวกับบิตคอยน์และเทคโนโลยีที่เกี่ยวข้อง',
    color: '#f07a2f'
  },
  {
    id: 'EO3',
    code: 'EO 3',
    title: 'ธุรกรรมและการเก็บรักษาเหรียญอย่างปลอดภัย',
    shortTitle: 'ธุรกรรม & ความปลอดภัย',
    description: 'สามารถทำธุรกรรมบิตคอยน์พื้นฐาน (on-chain และ Lightning) และอธิบายขั้นตอนการเก็บรักษาเหรียญอย่างปลอดภัยได้',
    color: '#4f8b57'
  },
  {
    id: 'EO4',
    code: 'EO 4',
    title: 'บทบาทในตลาดทุนและการประเมินมูลค่า',
    shortTitle: 'ตลาดทุน & มูลค่า',
    description: 'สามารถอธิบายบทบาทของบิตคอยน์ในตลาดทุน และยกตัวอย่างวิธีการประเมินมูลค่าพื้นฐานของบิตคอยน์ได้',
    color: '#8260c4'
  },
  {
    id: 'EO5',
    code: 'EO 5',
    title: 'กฎหมายและข้อกำหนดการกำกับดูแล',
    shortTitle: 'กฎหมาย & ข้อกำหนด',
    description: 'สามารถระบุข้อกำหนดทางกฎหมายที่เกี่ยวข้องกับการถือครองและใช้งานบิตคอยน์ได้',
    color: '#2f8c90'
  }
];

/**
 * Calculates raw points aggregation and normalized percentages for the selected units
 * across all defined Expected Outcomes (EO).
 */
export function calculateOutcomeBreakdown(
  selectedUnits: Unit[],
  definedOutcomes: ExpectedOutcome[] = DEFAULT_EXPECTED_OUTCOMES
): CurriculumOutcomeSummary {
  const outcomes = definedOutcomes && definedOutcomes.length > 0 ? definedOutcomes : DEFAULT_EXPECTED_OUTCOMES;
  const pointsMap: Record<string, number> = {};

  for (const o of outcomes) {
    pointsMap[o.id] = 0;
  }

  let totalPoints = 0;

  for (const unit of selectedUnits) {
    if (!unit.eoWeights) continue;
    for (const [eoId, weight] of Object.entries(unit.eoWeights)) {
      if (typeof weight === 'number' && weight > 0) {
        pointsMap[eoId] = (pointsMap[eoId] || 0) + weight;
        totalPoints += weight;
      }
    }
  }

  const items: OutcomeBreakdownItem[] = outcomes.map((outcome) => {
    const raw = pointsMap[outcome.id] || 0;
    const percentage = totalPoints > 0 ? Math.round((raw / totalPoints) * 1000) / 10 : 0;
    return {
      outcome,
      rawPoints: raw,
      percentage
    };
  });

  return {
    totalPoints,
    items
  };
}
