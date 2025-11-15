export default function PageHeader({ title, subtitle, right, className = "" }) {
  return (
    <div
      className={`mb-6 flex items-center justify-between ${className}`.trim()}
    >
      <div>
        {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      {right ? <div className="flex-shrink-0">{right}</div> : null}
    </div>
  );
}
