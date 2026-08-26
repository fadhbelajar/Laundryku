import React, { useState, useEffect } from 'react';
import { StorageService } from '../../data/storage';
import { AppSettings } from '../../types';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  textColor?: 'dark' | 'light';
  overrideUrl?: string;
  overrideShape?: 'rounded' | 'circle' | 'square' | 'original';
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  className = '', 
  showText = false,
  size = 'md',
  textColor = 'light',
  overrideUrl,
  overrideShape
}) => {
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setSettings(StorageService.getSettings());
      setImgError(false);
    };

    window.addEventListener('almawaddah_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('almawaddah_storage_updated', handleStorageUpdate);
  }, []);

  const sizeDimensions = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-3xl'
  };

  const activeShape = overrideShape || settings.logoShape || 'rounded';
  const shapeClasses = {
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
    square: 'rounded-lg',
    original: 'rounded-md'
  };

  const logoUrl = overrideUrl !== undefined ? overrideUrl : settings.appLogoUrl;
  const storeName = settings.storeName || 'LAUNDRY ALMAWADDAH';
  const tagline = settings.tagline || 'BERSIH • WANGI • RAPI • AMANAH';

  return (
    <div className="inline-flex items-center gap-3">
      {logoUrl && !imgError ? (
        <div 
          className={`relative overflow-hidden shrink-0 border border-emerald-500/30 bg-slate-900/80 shadow-md flex items-center justify-center p-0.5 ${shapeClasses[activeShape]} ${sizeDimensions[size]} ${className}`}
        >
          <img
            src={logoUrl}
            alt={storeName}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`w-full h-full object-contain ${activeShape === 'circle' ? 'rounded-full' : activeShape === 'rounded' ? 'rounded-xl' : 'rounded-md'}`}
          />
        </div>
      ) : (
        <div 
          className={`relative overflow-hidden shadow-md shrink-0 border border-emerald-500/40 bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950 text-white flex items-center justify-center font-black tracking-tighter ${shapeClasses[activeShape]} ${sizeDimensions[size]} ${className}`}
        >
          <span>{storeName.slice(0, 2).toUpperCase() || 'LA'}</span>
          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs animate-pulse" />
        </div>
      )}

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black text-sm sm:text-base leading-tight tracking-tight uppercase ${textColor === 'light' ? 'text-slate-100' : 'text-slate-900'}`}>
            {storeName}
          </span>
          <span className={`text-[10px] font-bold tracking-wider uppercase ${textColor === 'light' ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {tagline}
          </span>
        </div>
      )}
    </div>
  );
};
