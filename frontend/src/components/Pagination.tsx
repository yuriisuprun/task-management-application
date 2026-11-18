import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading = false,
}) => {
  // Hide pagination if there's only one page or no data
  if (!totalPages || totalPages <= 1 || !totalElements) return null;

  // Calculate start and end indices with fallback for NaN
  const safeCurrentPage = Number.isFinite(currentPage) ? currentPage : 0;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;
  const safeTotalElements = Number.isFinite(totalElements) ? totalElements : 0;
  const safeTotalPages = Number.isFinite(totalPages) ? totalPages : 1;

  const startIndex = safeCurrentPage * safePageSize + 1;
  const endIndex = Math.min((safeCurrentPage + 1) * safePageSize, safeTotalElements);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible) {
      for (let i = 0; i < safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);

      // Add ellipsis if there's a gap
      if (safeCurrentPage > 2) pages.push('...');

      // Show current page and adjacent pages
      const start = Math.max(1, safeCurrentPage - 1);
      const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 0) pages.push(i);
      }

      // Add ellipsis if there's a gap before last page
      if (safeCurrentPage < safeTotalPages - 3) pages.push('...');

      // Always show last page
      if (safeTotalPages > 1) pages.push(safeTotalPages - 1);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const canGoPrevious = safeCurrentPage > 0;
  const canGoNext = safeCurrentPage < safeTotalPages - 1;

  return (
    <div className="pagination">
      <button
        className="pagination-btn btn btn-secondary"
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={!canGoPrevious || isLoading}
        aria-label="Go to previous page"
      >
        ← Previous
      </button>

      <div className="pagination-pages">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-btn pagination-ellipsis">
                …
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === safeCurrentPage;

          return (
            <button
              key={pageNum}
              className={`pagination-btn btn btn-secondary ${isActive ? 'active' : ''}`}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              aria-label={`Go to page ${pageNum + 1}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum + 1}
            </button>
          );
        })}
      </div>

      <button
        className="pagination-btn btn btn-secondary"
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={!canGoNext || isLoading}
        aria-label="Go to next page"
      >
        Next →
      </button>

      <span className="pagination-info" aria-live="polite">
        Showing {startIndex}–{endIndex} of {safeTotalElements}
      </span>
    </div>
  );
};
