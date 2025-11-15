export default function Spinner({ size = "md", color = "primary" }) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-5 h-5 border-2",
    lg: "w-6 h-6 border-3",
  };
  const colorMap = {
    primary: "border-primary-600",
    secondary: "border-secondary-600",
    accent: "border-accent-600",
    gray: "border-gray-600",
  };
  const sizeClass = sizeMap[size] || sizeMap.md;
  const colorClass = colorMap[color] || colorMap.primary;

  return (
    <span
      aria-label="Loading"
      role="status"
      className={`inline-block ${sizeClass} border-t-transparent rounded-full animate-spin ${colorClass}`}
    />
  );
}
