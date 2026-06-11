import { useDarkMode } from "@/hooks/useDarkMode";
const DarkModeToggle = () => {
  const [dark, toggle] = useDarkMode();
  return <button onClick={toggle} className="text-lg" aria-label="Toggle dark mode">{dark ? "☀️" : "🌙"}</button>;
};
export default DarkModeToggle;
