import React from 'react';
import styles from '../CalendarioView.module.css';

interface CalendarMonthGridProps {
  selectedEventId: string;
  onSelectEventId: (id: string) => void;
}

export const CalendarMonthGrid: React.FC<CalendarMonthGridProps> = ({
  selectedEventId,
  onSelectEventId
}) => {
  return (
    <div className={styles.gridWrapper}>
      <div className={styles.daysHeaderRow}>
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
          <div key={d} className={styles.dayColHeader}>{d}</div>
        ))}
      </div>

      <div className={styles.cellsGrid}>
        {/* Week 1: 31 Mar to 06 Apr */}
        <div className={`${styles.dayCell} ${styles.dayCellOutside}`}><div className={styles.dayCellHeader}><span>31</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>01</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>02</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>03</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>04</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>05</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>06</span></div></div>

        {/* Week 2: 07 to 13 Apr */}
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>07</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>08</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>09</span></div></div>
        <div className={styles.dayCell}>
          <div className={styles.dayCellHeader}>
            <span>10</span>
            <span style={{ color: 'var(--emerald)', fontSize: '10px' }}>✔</span>
          </div>
          <div className={styles.eventBadgeTP}>TP Raft...</div>
        </div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>11</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>12</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>13</span></div></div>

        {/* Week 3: 14 to 20 Apr */}
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>14</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>15</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>16</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>17</span></div></div>
        <div className={styles.dayCell}>
          <div className={styles.dayCellHeader}>
            <span>18</span>
            <span style={{ color: 'var(--blue)', fontSize: '9px' }}>●</span>
          </div>
          <div className={styles.eventBadgeLab}>Lab: SQL... 14:00</div>
        </div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>19</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>20</span></div></div>

        {/* Week 4: 21 to 27 Apr */}
        <div
          className={`${styles.dayCell} ${selectedEventId === 'evt-3' ? styles.dayCellSelected : ''}`}
          onClick={() => onSelectEventId('evt-3')}
        >
          <div className={styles.dayCellHeader}>
            <span className={styles.dayCellToday}>21 HOY</span>
            <span style={{ color: 'var(--emerald)', fontSize: '9px' }}>●</span>
          </div>
          <div className={styles.eventBadgeStudy}>📖 Estudio 18:00 hs</div>
        </div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>22</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>23</span></div></div>
        <div
          className={`${styles.dayCell} ${selectedEventId === 'evt-1' ? styles.dayCellSelected : ''}`}
          style={{ borderLeft: '2px solid var(--red)' }}
          onClick={() => onSelectEventId('evt-1')}
        >
          <div className={styles.dayCellHeader}>
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>24 !</span>
            <span style={{ background: 'var(--red-alpha)', color: 'var(--red)', padding: '0 4px', borderRadius: '2px' }}>40%</span>
          </div>
          <div className={styles.eventBadgeExam}>★ 1° Parcial 09:00</div>
        </div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>25</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>26</span></div></div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>27</span></div></div>

        {/* Week 5: 28 Apr to 04 May */}
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>28</span></div></div>
        <div
          className={`${styles.dayCell} ${selectedEventId === 'evt-2' ? styles.dayCellSelected : ''}`}
          onClick={() => onSelectEventId('evt-2')}
        >
          <div className={styles.dayCellHeader}>
            <span>29</span>
            <span style={{ color: 'var(--purple)', fontSize: '9px' }}>●</span>
          </div>
          <div className={styles.eventBadgeTP}>TP Entrega BD II</div>
        </div>
        <div className={styles.dayCell}><div className={styles.dayCellHeader}><span>30</span></div></div>
        <div className={`${styles.dayCell} ${styles.dayCellOutside}`}><div className={styles.dayCellHeader}><span>01 Feriado</span></div></div>
        <div className={`${styles.dayCell} ${styles.dayCellOutside}`}><div className={styles.dayCellHeader}><span>02</span></div></div>
        <div className={`${styles.dayCell} ${styles.dayCellOutside}`}><div className={styles.dayCellHeader}><span>03</span></div></div>
        <div className={`${styles.dayCell} ${styles.dayCellOutside}`}><div className={styles.dayCellHeader}><span>04</span></div></div>
      </div>
    </div>
  );
};

export default CalendarMonthGrid;
