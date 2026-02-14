import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push('...');

      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <HiChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map((page, idx) =>
        typeof page === 'string' ? (
          <span key={`dots-${idx}`} className="px-2 text-dark-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-primary-600 text-white'
                : 'hover:bg-dark-700 text-dark-400 hover:text-dark-200'
            }`}
          >
            {page + 1}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <HiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
