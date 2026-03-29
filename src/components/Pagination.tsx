type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage < 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage <= totalPages - 2) {
    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }

  return [
    totalPages - 4,
    totalPages - 3,
    totalPages - 2,
    totalPages - 1,
    totalPages,
  ];
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="pagination">
      <button
        name="first"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        First
      </button>

      <button
        name="previous"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          name={`page-${page}`}
          onClick={() => onPageChange(page)}
          disabled={currentPage === page}
          className={currentPage === page ? 'active-page' : ''}
        >
          {page}
        </button>
      ))}

      <button
        name="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>

      <button
        name="last"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    </div>
  );
}

export default Pagination;