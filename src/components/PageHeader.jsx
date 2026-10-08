import React from 'react';

/**
 * PageHeader component for consistent page titles, context subtitles, and actions across dashboards.
 */
const PageHeader = ({
  title,
  subtitle,
  badge,
  actions,
  className = ''
}) => {
  return (
    <div className={`page-header-wrapper ${className}`}>
      <div className="page-header-main">
        <div className="page-header-title-row">
          <h1 className="page-header-title">{title}</h1>
          {badge && <span className="page-header-badge">{badge}</span>}
        </div>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div className="page-header-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
