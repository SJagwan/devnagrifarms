import Spinner from "./Spinner";

const base =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600",
  secondary:
    "bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:ring-secondary-600",
  accent:
    "bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-600",
  outline:
    "border border-primary-600 text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-600",
  ghost: "text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-600",
};

const sizes = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  className = "",
  ...props
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const w = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${base} ${v} ${s} ${w} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 inline-flex">
          <Spinner size={size === "lg" ? "lg" : "sm"} />
        </span>
      )}
      {children}
    </button>
  );
}
