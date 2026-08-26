import { AppSettings } from '../types';

export interface ProcessedBrandingResult {
  appLogoUrl: string;
  faviconUrl: string;
  pwaIcon192Url: string;
  pwaIcon512Url: string;
  appleTouchIconUrl: string;
  receiptMonochromeUrl?: string;
  stats: {
    originalFileName: string;
    originalFileSizeKb: number;
    originalWidth: number;
    originalHeight: number;
    compressedLogoSizeKb: number;
    compressedFaviconSizeKb: number;
    compressedPwa192SizeKb: number;
    compressedPwa512SizeKb: number;
    totalCompressedSizeKb: number;
    savingsPercent: number;
  };
}

export interface ImageProcessingOptions {
  paddingRatio?: number; // 0 to 0.3 (default: 0.08)
  bgColor?: string; // hex or 'transparent' (default: 'transparent')
  shape?: 'rounded' | 'circle' | 'square' | 'original';
}

/**
 * Load an Image from File
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Gagal memuat file gambar. Pastikan format valid (PNG, JPG, SVG, WebP).'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * High-quality canvas render to data URL with automatic resizing & compression
 */
function renderCanvasToDataUrl(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  options: {
    fit?: 'contain' | 'cover' | 'fill';
    paddingRatio?: number;
    bgColor?: string;
    format?: 'image/png' | 'image/webp' | 'image/jpeg';
    quality?: number;
    monochrome?: boolean;
    shape?: 'rounded' | 'circle' | 'square' | 'original';
  } = {}
): string {
  const {
    fit = 'contain',
    paddingRatio = 0,
    bgColor = 'transparent',
    format = 'image/png',
    quality = 0.92,
    monochrome = false,
    shape = 'original'
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context tidak tersedia.');

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Clear or Fill background
  if (bgColor && bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  // Clip shape if requested (e.g. circle / rounded)
  if (shape === 'circle') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(targetWidth / 2, targetHeight / 2, Math.min(targetWidth, targetHeight) / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  } else if (shape === 'rounded') {
    const radius = Math.min(targetWidth, targetHeight) * 0.2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(targetWidth - radius, 0);
    ctx.quadraticCurveTo(targetWidth, 0, targetWidth, radius);
    ctx.lineTo(targetWidth, targetHeight - radius);
    ctx.quadraticCurveTo(targetWidth, targetHeight, targetWidth - radius, targetHeight);
    ctx.lineTo(radius, targetHeight);
    ctx.quadraticCurveTo(0, targetHeight, 0, targetHeight - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();
  }

  // Calculate draw dimensions with padding
  const paddingX = targetWidth * paddingRatio;
  const paddingY = targetHeight * paddingRatio;
  const availableWidth = targetWidth - paddingX * 2;
  const availableHeight = targetHeight - paddingY * 2;

  let drawWidth = availableWidth;
  let drawHeight = availableHeight;
  let drawX = paddingX;
  let drawY = paddingY;

  const imgAspect = img.width / img.height;
  const targetAspect = availableWidth / availableHeight;

  if (fit === 'contain') {
    if (imgAspect > targetAspect) {
      drawWidth = availableWidth;
      drawHeight = availableWidth / imgAspect;
      drawY = paddingY + (availableHeight - drawHeight) / 2;
    } else {
      drawHeight = availableHeight;
      drawWidth = availableHeight * imgAspect;
      drawX = paddingX + (availableWidth - drawWidth) / 2;
    }
  } else if (fit === 'cover') {
    if (imgAspect > targetAspect) {
      drawHeight = availableHeight;
      drawWidth = availableHeight * imgAspect;
      drawX = paddingX - (drawWidth - availableWidth) / 2;
    } else {
      drawWidth = availableWidth;
      drawHeight = availableWidth / imgAspect;
      drawY = paddingY - (drawHeight - availableHeight) / 2;
    }
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

  if (shape === 'circle' || shape === 'rounded') {
    ctx.restore();
  }

  // If Monochrome thermal receipt logo requested
  if (monochrome) {
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha < 64) {
        // Transparent pixel -> White for thermal print
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      } else {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const val = gray < 140 ? 0 : 255; // High-contrast black & white threshold
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return canvas.toDataURL(format, quality);
}

/**
 * Helper to estimate data URL size in KB
 */
function getDataUrlSizeKb(dataUrl: string): number {
  const base64Str = dataUrl.split(',')[1] || '';
  const bytes = (base64Str.length * 3) / 4;
  return Number((bytes / 1024).toFixed(1));
}

/**
 * Complete Automatic Image Resizing, Multi-Format Generation & Compression Engine
 */
export async function processAutomaticBrandingUpload(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<ProcessedBrandingResult> {
  const img = await loadImageFromFile(file);

  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;
  const originalSizeKb = Number((file.size / 1024).toFixed(1));

  // 1. App Logo (Main Header / App interface): max 512x512, preserved aspect ratio
  const maxLogoDim = 512;
  let logoW = origWidth;
  let logoH = origHeight;
  if (logoW > maxLogoDim || logoH > maxLogoDim) {
    if (logoW > logoH) {
      logoH = Math.round((logoH * maxLogoDim) / logoW);
      logoW = maxLogoDim;
    } else {
      logoW = Math.round((logoW * maxLogoDim) / logoH);
      logoH = maxLogoDim;
    }
  }

  const appLogoUrl = renderCanvasToDataUrl(img, logoW, logoH, {
    fit: 'contain',
    format: 'image/png',
    quality: 0.92,
    shape: options.shape || 'original'
  });

  // 2. Favicon (Browser Tab): 64x64 square crisp icon
  const faviconUrl = renderCanvasToDataUrl(img, 64, 64, {
    fit: 'contain',
    paddingRatio: 0.05,
    format: 'image/png',
    quality: 0.95
  });

  // 3. PWA Icon 192x192 (Standard Mobile / Install prompt)
  const pwaIcon192Url = renderCanvasToDataUrl(img, 192, 192, {
    fit: 'contain',
    paddingRatio: options.paddingRatio ?? 0.08,
    bgColor: options.bgColor || 'transparent',
    format: 'image/png',
    quality: 0.95
  });

  // 4. PWA Icon 512x512 (Splash Screen & High-DPI screens)
  const pwaIcon512Url = renderCanvasToDataUrl(img, 512, 512, {
    fit: 'contain',
    paddingRatio: options.paddingRatio ?? 0.08,
    bgColor: options.bgColor || 'transparent',
    format: 'image/png',
    quality: 0.95
  });

  // 5. Apple Touch Icon 180x180 (iOS Home Screen Shortcut)
  const appleTouchIconUrl = renderCanvasToDataUrl(img, 180, 180, {
    fit: 'contain',
    paddingRatio: 0.1,
    bgColor: options.bgColor && options.bgColor !== 'transparent' ? options.bgColor : '#020617',
    format: 'image/png',
    quality: 0.95
  });

  // 6. Monochrome receipt version (200x200 1-bit crisp)
  const receiptMonochromeUrl = renderCanvasToDataUrl(img, 200, 200, {
    fit: 'contain',
    paddingRatio: 0.05,
    bgColor: '#ffffff',
    format: 'image/png',
    monochrome: true,
    quality: 0.9
  });

  const logoSizeKb = getDataUrlSizeKb(appLogoUrl);
  const faviconSizeKb = getDataUrlSizeKb(faviconUrl);
  const pwa192SizeKb = getDataUrlSizeKb(pwaIcon192Url);
  const pwa512SizeKb = getDataUrlSizeKb(pwaIcon512Url);
  const totalCompressedSizeKb = Number((logoSizeKb + faviconSizeKb + pwa192SizeKb + pwa512SizeKb).toFixed(1));

  const savings = Math.max(0, Math.round(((file.size / 1024 - logoSizeKb) / (file.size / 1024)) * 100));

  return {
    appLogoUrl,
    faviconUrl,
    pwaIcon192Url,
    pwaIcon512Url,
    appleTouchIconUrl,
    receiptMonochromeUrl,
    stats: {
      originalFileName: file.name,
      originalFileSizeKb: originalSizeKb,
      originalWidth: origWidth,
      originalHeight: origHeight,
      compressedLogoSizeKb: logoSizeKb,
      compressedFaviconSizeKb: faviconSizeKb,
      compressedPwa192SizeKb: pwa192SizeKb,
      compressedPwa512SizeKb: pwa512SizeKb,
      totalCompressedSizeKb,
      savingsPercent: savings
    }
  };
}

let activeManifestBlobUrl: string | null = null;

/**
 * Apply Brand Logo, Favicon & Dynamic PWA Manifest directly to document / browser environment
 */
export function applyBrandingToDOM(settings: AppSettings): void {
  if (typeof document === 'undefined') return;

  // 1. Update Document Title
  if (settings.storeName) {
    document.title = `${settings.storeName} - ${settings.tagline || 'Sistem Laundry Terpadu'}`;
  }

  // 2. Update Favicon in <head>
  const faviconTarget = settings.faviconUrl || settings.appLogoUrl;
  if (faviconTarget) {
    let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.type = 'image/png';
    faviconLink.href = faviconTarget;

    // Also update shortcut icon
    let shortcutLink = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
    if (!shortcutLink) {
      shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      document.head.appendChild(shortcutLink);
    }
    shortcutLink.href = faviconTarget;
  }

  // 3. Update Apple Touch Icon in <head>
  const appleIconTarget = settings.appleTouchIconUrl || settings.pwaIcon192Url || settings.appLogoUrl;
  if (appleIconTarget) {
    let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = appleIconTarget;
  }

  // 4. Dynamic PWA Web App Manifest
  try {
    const manifestJson = {
      name: settings.storeName || 'Laundry Almawaddah',
      short_name: (settings.storeName || 'Almawaddah').slice(0, 18),
      description: settings.tagline || 'Sistem Manajemen Operasional Laundry Terpadu Pesantren',
      start_url: '/',
      display: 'standalone',
      background_color: '#020617',
      theme_color: '#020617',
      icons: [
        {
          src: settings.pwaIcon192Url || settings.appLogoUrl || '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: settings.pwaIcon512Url || settings.appLogoUrl || '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };

    if (activeManifestBlobUrl) {
      URL.revokeObjectURL(activeManifestBlobUrl);
    }

    const blob = new Blob([JSON.stringify(manifestJson, null, 2)], { type: 'application/manifest+json' });
    activeManifestBlobUrl = URL.createObjectURL(blob);

    let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = activeManifestBlobUrl;
  } catch (err) {
    console.error('Gagal membuat dynamic manifest:', err);
  }
}

/**
 * Trigger download of any base64 / data URL asset
 */
export function downloadDataUrlFile(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
