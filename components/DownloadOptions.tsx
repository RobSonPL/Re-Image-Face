
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

interface DownloadOptionsProps {
  imageUrl: string;
}

export const DownloadOptions: React.FC<DownloadOptionsProps> = ({ imageUrl }) => {
  const { t } = useLanguage();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(0.9);

  const socialPlatforms = [
    { name: 'LinkedIn', size: 400, id: 'linkedin' },
    { name: 'Facebook', size: 1080, id: 'facebook' },
    { name: 'Instagram', size: 1080, id: 'instagram' },
    { name: 'Twitter / X', size: 400, id: 'twitter' },
    { name: 'TikTok', size: 200, id: 'tiktok' },
    { name: 'CV / Resume', size: 600, id: 'cv' },
    { name: 'Ebook Author', size: 1200, id: 'ebook' },
  ];

  const handleDownload = async (format: 'jpeg' | 'png', id: string, maxWidth?: number) => {
    setProcessingId(id);
    try {
      // If original is jpeg, requested is jpeg, no resize, and high quality -> direct download
      if (format === 'jpeg' && imageUrl.startsWith('data:image/jpeg') && !maxWidth && quality > 0.95) {
          const link = document.createElement('a');
          link.download = `professional-headshot-${id}.jpg`;
          link.href = imageUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setProcessingId(null);
          return;
      }

      // Otherwise use Canvas for conversion, resizing or compression
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (maxWidth && width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Fill white background for JPEGs to avoid potential transparency issues
        if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        // Use selected quality for JPEGs, 1.0 for PNGs
        const exportQuality = format === 'jpeg' ? quality : 1.0;
        const dataUrl = canvas.toDataURL(`image/${format}`, exportQuality);
        
        const link = document.createElement('a');
        const ext = format === 'jpeg' ? 'jpg' : 'png';
        const suffix = id === 'full-res' ? '' : `-${id}`;
        link.download = `professional-headshot${suffix}.${ext}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleEmail = async () => {
     setProcessingId('email');
     try {
         const response = await fetch(imageUrl);
         const blob = await response.blob();
         
         // Try to write to clipboard so user can paste into email
         try {
             const data = [new ClipboardItem({ [blob.type]: blob })];
             await navigator.clipboard.write(data);
             alert(t.emailCopiedAlert);
         } catch (err) {
             console.log("Clipboard write failed", err);
         }

         const subject = encodeURIComponent(t.emailSubject);
         const body = encodeURIComponent(t.emailBody);
         window.location.href = `mailto:?subject=${subject}&body=${body}`;
     } catch (e) {
         console.error(e);
     } finally {
         setProcessingId(null);
     }
  };

  const handleCopyLink = () => {
     setProcessingId('link');
     navigator.clipboard.writeText(imageUrl).then(() => {
        alert(t.linkCopied);
        setProcessingId(null);
     }).catch(() => setProcessingId(null));
  };

  const DownloadIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );

  const EmailIcon = () => (
     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
     </svg>
  );

  const LinkIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );

  const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="mt-6 space-y-4">
      {/* Quality Slider */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex justify-between items-center mb-2">
           <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.jpegQuality}</label>
           <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{Math.round(quality * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="10" 
          max="100" 
          step="5"
          value={quality * 100} 
          onChange={(e) => setQuality(Number(e.target.value) / 100)}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700"
        />
        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
           <span>{t.smallerFile}</span>
           <span>{t.betterQuality}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button 
            onClick={() => handleDownload('png', 'full-res')}
            disabled={!!processingId}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
            {processingId === 'full-res' ? <Spinner /> : <DownloadIcon />}
            {t.downloadPng}
            </button>
            <button 
            onClick={() => handleDownload('jpeg', 'full-res')}
            disabled={!!processingId}
            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
            {processingId === 'full-res' ? <Spinner /> : <DownloadIcon />}
            {t.downloadJpg}
            </button>
          </div>
          
          <div className="flex gap-3">
            <button 
                onClick={handleEmail}
                disabled={!!processingId}
                className="flex-1 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
                {processingId === 'email' ? <Spinner /> : <EmailIcon />}
                {t.sendEmail}
            </button>
            <button 
                onClick={handleCopyLink}
                disabled={!!processingId}
                className="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
                {processingId === 'link' ? <Spinner /> : <LinkIcon />}
                {t.copyLink}
            </button>
          </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.optimizedFor}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {socialPlatforms.map(platform => (
                <button
                    key={platform.id}
                    onClick={() => handleDownload('jpeg', platform.id, platform.size)}
                    disabled={!!processingId}
                    className="relative flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-center group disabled:opacity-50"
                >
                    <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 mb-1">{platform.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">{platform.size}px</span>
                    {processingId === platform.id && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                            <div className="scale-75 text-indigo-600"><Spinner /></div>
                        </div>
                    )}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};
