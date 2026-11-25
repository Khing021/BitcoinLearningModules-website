import React, { useState, useMemo } from 'react';
import type { ExpectedOutcome, Unit } from '../lib/contracts';
import { calculateOutcomeBreakdown, DEFAULT_EXPECTED_OUTCOMES } from '../lib/outcomes';

interface OutcomeBreakdownProps {
  selectedUnits: Unit[];
  outcomes?: ExpectedOutcome[];
}

export const OutcomeBreakdown: React.FC<OutcomeBreakdownProps> = ({
  selectedUnits,
  outcomes = DEFAULT_EXPECTED_OUTCOMES
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredEoId, setHoveredEoId] = useState<string | null>(null);

  const summary = useMemo(
    () => calculateOutcomeBreakdown(selectedUnits, outcomes),
    [selectedUnits, outcomes]
  );

  // SVG Donut calculation
  const radius = 68;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const donutSegments = summary.items.map((item) => {
    const dashLength = (item.percentage / 100) * circumference;
    const offset = -(accumulatedPercent / 100) * circumference;
    accumulatedPercent += item.percentage;
    return {
      ...item,
      dashLength,
      offset
    };
  });

  return (
    <div className="eo-breakdown-container">
      {/* GitHub-style Stacked Horizontal Bar */}
      <div 
        className="eo-progress-bar"
        onClick={() => setIsModalOpen(true)}
        title="คลิกเพื่อดูรายละเอียดและตารางสมรรถนะ (EO)"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsModalOpen(true); }}
      >
        {summary.totalPoints === 0 ? (
          <div className="eo-progress-segment empty" style={{ width: '100%' }} />
        ) : (
          summary.items.map((item) => (
            item.percentage > 0 && (
              <div
                key={item.outcome.id}
                className={`eo-progress-segment ${hoveredEoId === item.outcome.id ? 'highlight' : ''}`}
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.outcome.color
                }}
                onMouseEnter={() => setHoveredEoId(item.outcome.id)}
                onMouseLeave={() => setHoveredEoId(null)}
              />
            )
          ))
        )}
      </div>

      {/* Legend Row */}
      <div 
        className="eo-legend-row"
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsModalOpen(true); }}
        title="คลิกเพื่อดูรายละเอียดและตารางสมรรถนะ (EO)"
      >
        <div className="eo-legend-items">
          {summary.items.map((item) => (
            <div
              key={item.outcome.id}
              className={`eo-legend-item ${hoveredEoId === item.outcome.id ? 'active' : ''}`}
              onMouseEnter={() => setHoveredEoId(item.outcome.id)}
              onMouseLeave={() => setHoveredEoId(null)}
              title={`${item.outcome.title}: ${item.rawPoints} แต้ม (${item.percentage}%)`}
            >
              <span className="eo-dot" style={{ backgroundColor: item.outcome.color }} />
              <span className="eo-code">{item.outcome.code}</span>
              <span className="eo-percent">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Modal */}
      {isModalOpen && (
        <div className="eo-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="eo-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <header className="eo-modal-header">
              <div>
                <h3>การกระจายน้ำหนักสมรรถนะ (Expected Outcomes: EO)</h3>
                <p className="eo-modal-subtitle">
                  สัดส่วนผลลัพธ์การเรียนรู้ที่คาดหวังของชุดการสอนที่เลือก ({selectedUnits.length} ยูนิต • รวม {summary.totalPoints} แต้ม)
                </p>
              </div>
              <button 
                type="button" 
                className="eo-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="ปิดหน้าต่าง"
              >
                ✕
              </button>
            </header>

            <div className="eo-modal-body">
              {/* Donut Chart & Outcome Cards */}
              <div className="eo-chart-section">
                <div className="eo-donut-wrapper">
                  <svg viewBox="0 0 180 180" className="eo-donut-svg">
                    <circle
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="transparent"
                      stroke="#f0f2f5"
                      strokeWidth={strokeWidth}
                    />
                    {summary.totalPoints > 0 && donutSegments.map((item) => (
                      item.percentage > 0 && (
                        <circle
                          key={item.outcome.id}
                          cx="90"
                          cy="90"
                          r={radius}
                          fill="transparent"
                          stroke={item.outcome.color}
                          strokeWidth={hoveredEoId === item.outcome.id ? strokeWidth + 4 : strokeWidth}
                          strokeDasharray={`${item.dashLength} ${circumference}`}
                          strokeDashoffset={item.offset}
                          transform="rotate(-90 90 90)"
                          style={{ transition: 'stroke-width 0.2s ease, opacity 0.2s ease' }}
                          opacity={hoveredEoId && hoveredEoId !== item.outcome.id ? 0.45 : 1}
                          onMouseEnter={() => setHoveredEoId(item.outcome.id)}
                          onMouseLeave={() => setHoveredEoId(null)}
                        />
                      )
                    ))}
                    <text x="90" y="86" textAnchor="middle" className="eo-donut-center-title">
                      {summary.totalPoints > 0 ? '100%' : '0%'}
                    </text>
                    <text x="90" y="104" textAnchor="middle" className="eo-donut-center-sub">
                      {summary.totalPoints} แต้ม
                    </text>
                  </svg>
                </div>

                <div className="eo-cards-grid">
                  {summary.items.map((item) => (
                    <div 
                      key={item.outcome.id} 
                      className={`eo-outcome-card ${hoveredEoId === item.outcome.id ? 'highlighted' : ''}`}
                      onMouseEnter={() => setHoveredEoId(item.outcome.id)}
                      onMouseLeave={() => setHoveredEoId(null)}
                    >
                      <div className="eo-card-header">
                        <span className="eo-card-badge" style={{ backgroundColor: item.outcome.color }}>
                          {item.outcome.code}
                        </span>
                        <span className="eo-card-title">{item.outcome.shortTitle}</span>
                        <span className="eo-card-value">
                          {item.percentage}% <span className="eo-card-points">({item.rawPoints} แต้ม)</span>
                        </span>
                      </div>
                      <p className="eo-card-desc">{item.outcome.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competency Matrix Table */}
              <div className="eo-table-section">
                <h4>ตารางแจกแจงค่าน้ำหนักรายยูนิต (Competency Matrix)</h4>
                <div className="eo-table-scroll-container">
                  <table className="eo-matrix-table">
                    <thead>
                      <tr>
                        <th style={{ width: '48px', textAlign: 'center' }}>ลำดับ</th>
                        <th>ยูนิตการสอน</th>
                        <th>บทเรียน (Chapter)</th>
                        {summary.items.map((item) => (
                          <th key={item.outcome.id} style={{ textAlign: 'center', width: '80px' }}>
                            <span className="eo-th-badge" style={{ backgroundColor: item.outcome.color }}>
                              {item.outcome.code}
                            </span>
                          </th>
                        ))}
                        <th style={{ textAlign: 'center', width: '70px' }}>รวมแต้ม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUnits.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                            ยังไม่มีการเลือกยูนิต
                          </td>
                        </tr>
                      ) : (
                        selectedUnits.map((unit, index) => {
                          const w = unit.eoWeights || {};
                          let rowTotal = 0;
                          return (
                            <tr key={unit.unitId}>
                              <td style={{ textAlign: 'center', color: '#888' }}>{index + 1}</td>
                              <td style={{ fontWeight: 500 }}>{unit.title}</td>
                              <td style={{ color: '#666', fontSize: '0.85rem' }}>{unit.chapter || '-'}</td>
                              {summary.items.map((item) => {
                                const pts = w[item.outcome.id] || 0;
                                rowTotal += pts;
                                return (
                                  <td 
                                    key={item.outcome.id} 
                                    style={{ 
                                      textAlign: 'center',
                                      fontWeight: pts > 0 ? 600 : 400,
                                      color: pts > 0 ? item.outcome.color : '#ccc'
                                    }}
                                  >
                                    {pts > 0 ? pts : '-'}
                                  </td>
                                );
                              })}
                              <td style={{ textAlign: 'center', fontWeight: 600 }}>{rowTotal}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {selectedUnits.length > 0 && (
                      <tfoot>
                        <tr className="eo-footer-points">
                          <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>แต้มรวม:</td>
                          {summary.items.map((item) => (
                            <td key={item.outcome.id} style={{ textAlign: 'center', fontWeight: 700, color: item.outcome.color }}>
                              {item.rawPoints}
                            </td>
                          ))}
                          <td style={{ textAlign: 'center', fontWeight: 700 }}>{summary.totalPoints}</td>
                        </tr>
                        <tr className="eo-footer-percentage">
                          <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>สัดส่วนการประเมิน (%):</td>
                          {summary.items.map((item) => (
                            <td key={item.outcome.id} style={{ textAlign: 'center', fontWeight: 700, color: item.outcome.color }}>
                              {item.percentage}%
                            </td>
                          ))}
                          <td style={{ textAlign: 'center', fontWeight: 700 }}>100%</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
