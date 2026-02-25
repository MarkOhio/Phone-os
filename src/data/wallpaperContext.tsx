import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * WallpaperContext - Manages wallpaper selection and storage
 *
 * Features:
 * - Default wallpaper from public/wallpaper.jpg
 * - User uploads stored as base64 strings in localStorage
 * - 2MB max storage limit for all uploads
 * - Delete functionality (default wallpaper cannot be deleted)
 * - Global access to current wallpaper and wallpaper list
 */

interface WallpaperItem {
  id: string; // "default" or timestamp string
  name: string; // "Default Wallpaper" or filename
  src: string; // base64 string or URL
  isDefault: boolean;
  isSelected: boolean;
  size?: number; // Size in bytes for tracking storage
}

interface WallpaperContextType {
  wallpapers: WallpaperItem[];
  currentWallpaper: WallpaperItem | null;
  selectedWallpaperSrc: string; // The actual image src to use as background
  selectWallpaper: (id: string) => void;
  uploadWallpaper: (file: File) => Promise<{ success: boolean; error?: string }>;
  deleteWallpaper: (id: string) => void;
  storageUsed: number; // bytes used by uploaded wallpapers
  storageLimit: number; // 2MB in bytes
  isStorageFull: boolean;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(
  undefined
);

const STORAGE_KEY = "phone_os_wallpapers";
const SELECTED_KEY = "phone_os_selected_wallpaper";
const STORAGE_LIMIT = 2 * 1024 * 1024; // 2MB in bytes
const DEFAULT_WALLPAPER_ID = "default";
const DEFAULT_WALLPAPER_URL = "/wallpaper.jpg";

/**
 * WallpaperProvider - Wrap your app with this to enable wallpaper functionality
 */
export function WallpaperProvider({ children }: { children: React.ReactNode }) {
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [currentWallpaper, setCurrentWallpaper] = useState<WallpaperItem | null>(
    null
  );
  const [selectedWallpaperSrc, setSelectedWallpaperSrc] = useState<string>(
    DEFAULT_WALLPAPER_URL
  );

  // Initialize wallpapers from localStorage on mount
  useEffect(() => {
    const savedWallpapers = localStorage.getItem(STORAGE_KEY);
    const savedSelected = localStorage.getItem(SELECTED_KEY);

    // Create default wallpaper item
    const defaultWallpaper: WallpaperItem = {
      id: DEFAULT_WALLPAPER_ID,
      name: "Default Wallpaper",
      src: DEFAULT_WALLPAPER_URL,
      isDefault: true,
      isSelected: savedSelected === DEFAULT_WALLPAPER_ID || !savedSelected,
    };

    let uploadedWallpapers: WallpaperItem[] = [];

    if (savedWallpapers) {
      try {
        uploadedWallpapers = JSON.parse(savedWallpapers);
      } catch (error) {
        console.error("Failed to parse wallpapers from localStorage:", error);
      }
    }

    const allWallpapers = [defaultWallpaper, ...uploadedWallpapers];

    // Find the selected wallpaper
    const selected = allWallpapers.find((w) => w.isSelected);

    setWallpapers(allWallpapers);
    setCurrentWallpaper(selected || defaultWallpaper);
    setSelectedWallpaperSrc(selected?.src || DEFAULT_WALLPAPER_URL);
  }, []);

  /**
   * Calculate total storage used by uploaded wallpapers (in bytes)
   */
  const getStorageUsed = () => {
    return wallpapers
      .filter((w) => !w.isDefault)
      .reduce((total, w) => total + (w.size || 0), 0);
  };

  const storageUsed = getStorageUsed();
  const isStorageFull = storageUsed >= STORAGE_LIMIT;

  /**
   * Select a wallpaper and save to localStorage
   */
  const selectWallpaper = (id: string) => {
    setWallpapers((prev) =>
      prev.map((w) => ({
        ...w,
        isSelected: w.id === id,
      }))
    );

    const selected = wallpapers.find((w) => w.id === id);
    if (selected) {
      setCurrentWallpaper(selected);
      setSelectedWallpaperSrc(selected.src);
      localStorage.setItem(SELECTED_KEY, id);
    }
  };

  /**
   * Upload a wallpaper from file
   * - Converts to base64
   * - Checks storage limit
   * - Saves to localStorage
   */
  const uploadWallpaper = async (
    file: File
  ): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        resolve({ success: false, error: "Please select an image file" });
        return;
      }

      // Check file size (rough estimate before compression)
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit for original file
        resolve({
          success: false,
          error: "File is too large. Please select a smaller image.",
        });
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const estimatedSize = Math.ceil((base64String.length * 3) / 4); // Rough estimate

        // Check if adding this wallpaper would exceed storage limit
        if (storageUsed + estimatedSize > STORAGE_LIMIT) {
          resolve({
            success: false,
            error: "Not enough storage space. Delete a wallpaper to add a new one.",
          });
          return;
        }

        // Create new wallpaper item
        const newWallpaper: WallpaperItem = {
          id: Date.now().toString(),
          name: file.name,
          src: base64String,
          isDefault: false,
          isSelected: false,
          size: estimatedSize,
        };

        // Add to wallpapers list
        setWallpapers((prev) => [...prev, newWallpaper]);

        // Save to localStorage
        const uploadedWallpapers = wallpapers.filter((w) => !w.isDefault);
        const updatedUploaded = [...uploadedWallpapers, newWallpaper];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUploaded));

        resolve({ success: true });
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: "Failed to read file. Please try again.",
        });
      };

      reader.readAsDataURL(file);
    });
  };

  /**
   * Delete a wallpaper (not allowed for default)
   */
  const deleteWallpaper = (id: string) => {
    // Cannot delete default wallpaper
    if (id === DEFAULT_WALLPAPER_ID) {
      return;
    }

    const wallpaperToDelete = wallpapers.find((w) => w.id === id);
    const wasSelected = wallpaperToDelete?.isSelected;

    // Remove from list
    setWallpapers((prev) => prev.filter((w) => w.id !== id));

    // If deleted wallpaper was selected, switch to default
    if (wasSelected) {
      selectWallpaper(DEFAULT_WALLPAPER_ID);
    }

    // Update localStorage
    const uploadedWallpapers = wallpapers.filter((w) => !w.isDefault && w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedWallpapers));
  };

  const value: WallpaperContextType = {
    wallpapers,
    currentWallpaper,
    selectedWallpaperSrc,
    selectWallpaper,
    uploadWallpaper,
    deleteWallpaper,
    storageUsed,
    storageLimit: STORAGE_LIMIT,
    isStorageFull,
  };

  return (
    <WallpaperContext.Provider value={value}>
      {children}
    </WallpaperContext.Provider>
  );
}

/**
 * useWallpaper - Hook to access wallpaper functionality
 */
export function useWallpaper() {
  const context = useContext(WallpaperContext);
  if (context === undefined) {
    throw new Error("useWallpaper must be used within WallpaperProvider");
  }
  return context;
}
