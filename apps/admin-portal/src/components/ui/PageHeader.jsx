export default function PageHeader({ title, subtitle, right, onBack, className = "" }) {
  return (
    <div
      className={`mb-6 flex items-center justify-between ${className}`.trim()}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="self-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      </div>
      {right ? <div className="flex-shrink-0">{right}</div> : null}
    </div>
  );
}
