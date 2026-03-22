export default function PageHeader({ title, subtitle, right, onBack, className = "" }) {
  return (
    <div
      className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${className}`.trim()}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex-shrink-0 self-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="min-w-0">
          {title && <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>}
          {subtitle && <p className="text-sm sm:text-base text-gray-600 truncate">{subtitle}</p>}
        </div>
      </div>
      {right ? <div className="flex-shrink-0">{right}</div> : null}
    </div>
  );
}
