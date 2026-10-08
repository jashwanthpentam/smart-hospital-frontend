import React from 'react';

/**
 * PriorityBadge component for representing patient urgency levels in Java PriorityQueue.
 * EMERGENCY -> Red (Priority 1)
 * URGENT    -> Orange (Priority 2)
 * NORMAL    -> Blue/Neutral (Priority 3)
 */
const PriorityBadge = ({ priority = 'NORMAL', showScore = false, className = '' }) => {
  const normalized = (priority || '').toUpperCase().trim();

  const getPriorityConfig = (val) => {
    switch (val) {
      case 'EMERGENCY':
        return {
          label: 'Emergency',
          score: 'Priority 1',
          icon: '🚨',
          badgeClass: 'badge-priority-emergency',
          pulse: true
        };
      case 'URGENT':
        return {
          label: 'Urgent',
          score: 'Priority 2',
          icon: '⚡',
          badgeClass: 'badge-priority-urgent',
          pulse: false
        };
      case 'NORMAL':
      default:
        return {
          label: 'Normal',
          score: 'Priority 3',
          icon: '📋',
          badgeClass: 'badge-priority-normal',
          pulse: false
        };
    }
  };

  const config = getPriorityConfig(normalized);

  return (
    <span className={`priority-pill ${config.badgeClass} ${className}`}>
      <span className="priority-icon" aria-hidden="true">{config.icon}</span>
      <span className="priority-label">{config.label}</span>
      {showScore && <span className="priority-rank-tag">({config.score})</span>}
    </span>
  );
};

export default PriorityBadge;
