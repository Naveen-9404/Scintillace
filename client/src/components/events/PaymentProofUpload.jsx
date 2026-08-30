import { useState, useRef } from "react";
import { FaCloudUploadAlt, FaSpinner, FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

/**
 * PaymentProofUpload
 * 
 * Handles uploading payment screenshots to Cloudinary using Unsigned Uploads.
 */
export default function PaymentProofUpload({ onUploadComplete, onUploadError }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setError("");
    setSuccess(false);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!cloudName || !uploadPreset) {
      setError("Cloudinary configuration is missing. Upload cannot proceed.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Upload failed");
      }

      const data = await response.json();
      setSuccess(true);
      if (onUploadComplete) {
        onUploadComplete({
          url: data.secure_url,
          publicId: data.public_id,
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "An error occurred during upload.");
      if (onUploadError) onUploadError(err);
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onUploadComplete) {
      onUploadComplete(null);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Payment Screenshot</h3>
      
      {!file ? (
        <div
          className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
          />
          <FaCloudUploadAlt className="mx-auto text-4xl text-purple-400 mb-3" />
          <p className="text-gray-300 font-medium mb-1">Click to upload screenshot</p>
          <p className="text-sm text-gray-500">JPG, PNG, WebP up to 5MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/50 flex items-center justify-center">
            <img 
              src={previewUrl} 
              alt="Payment Proof Preview" 
              className="max-h-full max-w-full object-contain"
            />
            {!success && !uploading && (
              <button
                onClick={clearSelection}
                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg transition-colors"
                title="Remove image"
              >
                <FaTimes />
              </button>
            )}
            
            {success && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-black/50 px-4 py-2 rounded-lg flex items-center gap-2 text-green-400 font-medium border border-green-500/30">
                  <FaCheckCircle /> Uploaded Successfully
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <FaExclamationCircle className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!success && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <FaCloudUploadAlt /> Upload Screenshot
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
