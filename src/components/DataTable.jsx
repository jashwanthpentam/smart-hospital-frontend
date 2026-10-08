import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no records to display at this time.',
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  rowKey = 'id',
  getRowClassName,
  className = ''
}) => {
  if (loading) {
    return <LoadingSpinner text="Loading records..." />;
  }

  return (
    <div className={`table-container-card ${className}`}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={col.width ? { width: col.width } : {}}
                  className={col.headerClassName || ''}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-table-cell">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyMessage}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const customRowClass = getRowClassName ? getRowClassName(row, rowIdx) : '';
                const key = row[rowKey] !== undefined ? row[rowKey] : rowIdx;
                return (
                  <tr key={key} className={customRowClass}>
                    {columns.map((col, colIdx) => (
                      <td key={col.key || colIdx} className={col.cellClassName || ''}>
                        {col.render ? col.render(row, rowIdx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="table-pagination-bar">
          <div className="pagination-text">
            Page <span className="font-semibold">{currentPage + 1}</span> of <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              disabled={currentPage <= 0}
              onClick={() => onPageChange(currentPage - 1)}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
