const variants = { primary: "bg-primary text-white hover:bg-primary-dark", outline: "border border-primary text-primary hover:bg-primary hover:text-white", danger: "bg-red-600 text-white hover:bg-red-700", ghost: "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800" };
const sizes    = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };

const Button = ({ children, variant = "primary", size = "md", loading = false, className = "", ...props }) => (
  <button className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
    {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
    {children}
  </button>
);
export default Button;
