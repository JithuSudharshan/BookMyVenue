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
    <div className="flex items-center justify-center gap-1.5 py-[18px] pb-1">
      <span className="mr-auto text-muted text-[13px]">
        Showing <strong className="font-bold">{startItem}–{endItem}</strong> of <strong className="font-bold">{totalItems}</strong>
      </span>

      <button
        className="inline-flex items-center gap-1 min-h-[34px] px-3 text-[#6b5555] text-[13px] font-bold bg-white border border-line rounded-[7px] disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-admin-red-soft hover:not-disabled:border-[#fecaca] hover:not-disabled:text-admin-red transition-all"
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span>Prev</span>
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page) =>
          typeof page === 'string' ? (
            <span className="grid place-items-center min-w-[28px] h-[34px] text-muted text-sm tracking-[2px]" key={page}>
              …
            </span>
          ) : (
            <button
              className={`grid place-items-center min-w-[34px] h-[34px] px-1 text-[13px] font-bold border rounded-[7px] transition-all ${
                page === currentPage
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-transparent border-transparent hover:bg-admin-red-soft hover:border-[#fecaca] hover:text-admin-red'
              }`}
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
        className="inline-flex items-center gap-1 min-h-[34px] px-3 text-[#6b5555] text-[13px] font-bold bg-white border border-line rounded-[7px] disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-admin-red-soft hover:not-disabled:border-[#fecaca] hover:not-disabled:text-admin-red transition-all"
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;
