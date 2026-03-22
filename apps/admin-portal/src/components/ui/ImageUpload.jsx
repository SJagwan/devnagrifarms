import { useState, useRef } from "react";
import { presignAndUpload, getPublicImageUrl } from "../../lib/storage";

export default function ImageUpload({ 
  value, 
  onChange, 
  label = "Image", 
  prefix = "uploads",
  className = "" 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      
      const key = `${prefix}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { key: storedKey } = await presignAndUpload({ file, key });
      
      onChange(storedKey);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  // Resolve the URL if we have a value
  const imageUrl = value ? getPublicImageUrl(value) : null;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      {imageUrl ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 inline-block">
          <img 
            src={imageUrl} 
            alt="Uploaded" 
            className="w-full max-w-[200px] h-32 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="text-white text-sm font-medium bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-sm text-gray-600">
            {isUploading ? (
              <span className="text-primary-600 font-medium">Uploading...</span>
            ) : (
              <span>
                <span className="text-primary-600 font-medium hover:text-primary-500">Click to upload</span> or drag and drop
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
        disabled={isUploading}
      />
    </div>
  );
}
