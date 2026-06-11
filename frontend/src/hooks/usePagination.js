import { useState } from "react";
export const usePagination = (initialPage = 1, initialLimit = 12) => {
  const [page, setPage]   = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const goTo    = (p) => setPage(p);
  const reset   = ()  => setPage(1);
  return { page, limit, setPage, setLimit, goTo, reset };
};
