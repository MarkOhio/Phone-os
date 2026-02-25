import { useState, useRef } from "react";
import { useWallpaper } from "../../data/wallpaperContext";
import "./WallpaperApp.css";

/**
 * WallpaperApp - Wallpaper selector and manager
 *
 * Features:
 * - View all wallpapers (default + uploaded) in a grid
 * - Tap to select a wallpaper
 * - Upload new wallpapers from device
 * - Delete uploaded wallpapers
 * - View storage usage
 * - Storage full message with delete prompt
 */

export default function WallpaperApp() {
  const {
    wallpapers,
    selectWallpaper,
    uploadWallpaper,
    deleteWallpaper,
    isStorageFull,
    storageUsed,
    storageLimit,
  } = useWallpaper();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const result = await uploadWallpaper(file);

    if (result.success) {
      setUploadError(null);
    } else {
      setUploadError(result.error || "Upload failed");
    }

    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Format bytes to readable format
   */
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="wallpaper-app">
      {/* Header with storage info */}
      <div className="wallpaper-header">
        <h1>Wallpapers</h1>
        <div className="storage-info">
          <span className="storage-text">
            Storage: {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
          </span>
          <div className="storage-bar">
            <div
              className="storage-fill"
              style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Wallpapers grid */}
      <div className="wallpapers-grid">
        {wallpapers.map((wallpaper) => (
          <div
            key={wallpaper.id}
            className="wallpaper-item"
            onClick={() => {
              if (!wallpaper.isDefault) {
                setDeleteConfirm(null);
              }
              selectWallpaper(wallpaper.id);
            }}
          >
            {/* Thumbnail */}
            <div
              className="wallpaper-thumbnail"
              style={{
                backgroundImage: `url(${wallpaper.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Selection checkmark */}
              {wallpaper.isSelected && (
                <div className="checkmark-overlay">
                  <div className="checkmark">✓</div>
                </div>
              )}
            </div>

            {/* Wallpaper name */}
            <div className="wallpaper-name">{wallpaper.name}</div>

            {/* Delete button (only for uploaded wallpapers) */}
            {!wallpaper.isDefault && (
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(wallpaper.id);
                }}
                title="Delete wallpaper"
              >
                ✕
              </button>
            )}

            {/* Delete confirmation */}
            {deleteConfirm === wallpaper.id && (
              <div className="delete-confirm-overlay">
                <div className="delete-confirm">
                  <p>Delete this wallpaper?</p>
                  <div className="confirm-buttons">
                    <button
                      className="confirm-yes"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWallpaper(wallpaper.id);
                        setDeleteConfirm(null);
                      }}
                    >
                      Yes
                    </button>
                    <button
                      className="confirm-no"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(null);
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Storage full placeholder */}
        {isStorageFull && (
          <div className="wallpaper-item storage-full-item">
            <div className="storage-full-content">
              <div className="storage-full-icon">⚠️</div>
              <div className="storage-full-text">Storage Full</div>
              <div className="storage-full-hint">Delete a wallpaper to add more</div>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="error-banner">
          <span>{uploadError}</span>
          <button
            className="error-close"
            onClick={() => setUploadError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload button (fixed at bottom) */}
      <div className="upload-section">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading || isStorageFull}
          style={{ display: "none" }}
        />
        <button
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isStorageFull}
        >
          {uploading ? "Uploading..." : "Upload Wallpaper"}
        </button>
        {isStorageFull && (
          <div className="storage-full-message">
            Storage full. Delete a wallpaper to upload more.
          </div>
        )}
      </div>
    </div>
  );
}
