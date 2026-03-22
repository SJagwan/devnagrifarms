import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "./Button";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  const sizeClasses = {
    sm: "max-w-[95vw] sm:max-w-md",
    md: "max-w-[95vw] sm:max-w-lg",
    lg: "max-w-[95vw] sm:max-w-xl md:max-w-2xl",
    xl: "max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl",
  };

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Scrollable container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            className={`bg-white rounded-lg shadow-xl w-full my-8 ${sizeClasses[size]}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="!p-1 !h-auto text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">{children}</div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
