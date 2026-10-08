import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EmptyState component for clean placeholder display when lists, appointments, or queues have 0 records.
 */
const EmptyState = ({
  icon = '📋',
  title = 'No records found',
  description = 'There are currently no items to display in this section.',
  actionText,
  actionLink,
  onAction,
  className = ''
}) => {
  return (
    <div className={`empty-state-card ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {(actionText && (actionLink || onAction)) && (
        <div className="empty-state-action">
          {actionLink ? (
            <Link to={actionLink} className="btn btn-primary">
              {actionText}
            </Link>
          ) : (
            <button onClick={onAction} className="btn btn-primary">
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
