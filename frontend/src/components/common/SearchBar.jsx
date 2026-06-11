import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
const SearchBar = ({ onSearch, placeholder = "Search products..." }) => {
  const [q, setQ] = useState("");
  useDebounce(q, 400);
  const handle = (e) => { setQ(e.target.value); onSearch(e.target.value); };
  return <input value={q} onChange={handle} placeholder={placeholder} className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary" />;
};
export default SearchBar;
