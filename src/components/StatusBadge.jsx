import React from 'react';

/**
 * StatusBadge component for rendering standardized appointment and queue statuses.
 * Statuses: WAITING, CALLED, IN_PROGRESS, COMPLETED, CANCELLED, BOOKED
 */
const StatusBadge = ({ status = 'WAITING', className = '' }) => {
  const normalized = (status || '').toUpperCase().trim();

  const getStatusConfig = (val) => {
    switch (val) {
      case 'WAITING':
        return {
          label: 'Waiting',
          dotClass: 'status-dot-waiting',
          badgeClass: 'badge-status-waiting',
          icon: '⏳'
        };
      case 'CALLED':
        return {
          label: 'Called',
          dotClass: 'status-dot-called',
          badgeClass: 'badge-status-called',
          icon: '📢'
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Consultation',
          dotClass: 'status-dot-in-progress',
          badgeClass: 'badge-status-in-progress',
          icon: '🩺'
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          dotClass: 'status-dot-completed',
          badgeClass: 'badge-status-completed',
          icon: '✓'
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          dotClass: 'status-dot-cancelled',
          badgeClass: 'badge-status-cancelled',
          icon: '✕'
        };
      case 'BOOKED':
        return {
          label: 'Confirmed',
          dotClass: 'status-dot-booked',
          badgeClass: 'badge-status-booked',
          icon: '📅'
        };
      default:
        return {
          label: val || 'Unknown',
          dotClass: 'status-dot-default',
          badgeClass: 'badge-status-default',
          icon: '•'
        };
    }
  };

  const config = getStatusConfig(normalized);

  return (
    <span className={`status-pill ${config.badgeClass} ${className}`}>
      <span className={`status-dot ${config.dotClass}`} aria-hidden="true" />
      <span className="status-label">{config.label}</span>
    </span>
  );
};

export default StatusBadge;
