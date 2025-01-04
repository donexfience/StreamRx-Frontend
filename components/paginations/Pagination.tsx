import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  className = "",
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      // If 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(currentPage + 1, totalPages - 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg ${
          currentPage === 1
            ? "text-gray-500 cursor-not-allowed"
            : "text-white hover:bg-[#2C2C35]"
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page numbers */}
      <div className="flex gap-2">
        {getPageNumbers().map((page: any, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <div className="flex items-center px-2">
                <MoreHorizontal size={20} className="text-gray-500" />
              </div>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg ${
                  currentPage === page
                    ? "bg-purple-500 text-white"
                    : "text-white hover:bg-[#2C2C35]"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg ${
          currentPage === totalPages
            ? "text-gray-500 cursor-not-allowed"
            : "text-white hover:bg-[#2C2C35]"  
        }`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
