import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import TextField from "./TextField";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'info'
  requireNameMatch = false,
  nameToMatch = "",
  loading = false,
}) {
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = () => {
    if (requireNameMatch && inputValue !== nameToMatch) {
      return;
    }
    onConfirm();
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  const isConfirmDisabled =
    loading || (requireNameMatch && inputValue !== nameToMatch);

  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{message}</p>

        {requireNameMatch && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="font-semibold">{nameToMatch}</span> to
              confirm
            </label>
            <TextField
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={nameToMatch}
              autoFocus
            />
            {inputValue && inputValue !== nameToMatch && (
              <p className="mt-1 text-xs text-red-600">
                Name does not match. Please type exactly: {nameToMatch}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            isLoading={loading}
            className={`text-white ${variantStyles[variant]}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
