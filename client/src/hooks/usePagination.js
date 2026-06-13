import { useMemo, useState } from 'react';

function usePagination(items, itemsPerPage = 4) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, safeCurrentPage, itemsPerPage]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const resetPage = () => setCurrentPage(1);

  return {
    currentPage: safeCurrentPage,
    totalPages,
    paginatedItems,
    goToPage,
    resetPage,
    totalItems: items.length,
    itemsPerPage,
  };
}

export default usePagination;
