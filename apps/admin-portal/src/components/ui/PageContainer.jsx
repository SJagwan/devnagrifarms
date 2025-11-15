export default function PageContainer({
  children,
  maxWidth = "xl",
  className = "",
}) {
  const widthMap = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    none: "max-w-none",
  };
  const widthClass = widthMap[maxWidth] || widthMap.xl;
  return (
    <div className={`w-full ${className}`}>
      <div className={`${widthClass} px-4 sm:px-4 lg:px-6`}>{children}</div>
    </div>
  );
}
