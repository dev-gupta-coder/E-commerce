const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded border disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Prev</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1.5 rounded border text-sm ${p === currentPage ? "bg-primary text-white border-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{p}</button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded border disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Next</button>
    </div>
  );
};
export default Pagination;
