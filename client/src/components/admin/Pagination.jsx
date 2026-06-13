import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      start = 2;
      end = maxVisible;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - maxVisible + 1;
      end = totalPages - 1;
    }

    if (start > 2) pages.push('ellipsis-start');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('ellipsis-end');

    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}</strong>
      </span>

      {totalPages > 1 ? (
        <>
          <button
            className="pagination-btn"
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <div className="pagination-pages">
            {getPageNumbers().map((page) =>
              typeof page === 'string' ? (
                <span className="pagination-ellipsis" key={page}>
                  …
                </span>
              ) : (
                <button
                  className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                  type="button"
                  key={page}
                  onClick={() => onPageChange(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            className="pagination-btn"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </>
      ) : null}
    </div>
  );
}

export default Pagination;
