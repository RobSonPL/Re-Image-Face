
import React, { useState } from 'react';
import { generateVeoPrompt } from '../services/geminiService';
import { Button } from './Button';
import { useLanguage } from './LanguageContext';

interface VeoPromptGeneratorProps {
  sourceImage: string;
}

export const VeoPromptGenerator: React.FC<VeoPromptGeneratorProps> = ({ sourceImage }) => {
  const { t } = useLanguage();
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("Subtle Smile");

  const PRESETS = [
    "Subtle Smile",
    "Slow Zoom In",
    "Wind Blowing Hair",
    "Cinematic Pan",
    "Gentle Nod"
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedPrompt(null);

    const motion = customPrompt.trim() || selectedPreset;

    try {
      const prompt = await generateVeoPrompt(sourceImage, motion);
      setGeneratedPrompt(prompt);
    } catch (err: any) {
      setError(err.message || "Failed to generate prompt");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t.veoTitle}</h3>
          <p className="text-sm text-slate-500">{t.veoDesc}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">{t.veoMotion}</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => { setSelectedPreset(preset); setCustomPrompt(""); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
                  selectedPreset === preset && !customPrompt
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {t.videoPresets?.[preset] || preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <input
            type="text"
            placeholder={t.customPromptPlaceholder}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {!generatedPrompt && (
          <Button 
            onClick={handleGenerate} 
            isLoading={isGenerating} 
            className="w-full"
            variant="secondary"
          >
            {isGenerating ? t.veoGenerating : t.veoGenerateBtn}
          </Button>
        )}

        {generatedPrompt && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.veoPromptLabel}</label>
            <div className="relative">
              <textarea 
                readOnly
                value={generatedPrompt}
                className="w-full h-32 p-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
              <button 
                onClick={handleCopy}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                {copied ? (
                   <>
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                     {t.veoCopied}
                   </>
                ) : (
                   <>
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                     {t.veoCopy}
                   </>
                )}
              </button>
            </div>
             <button 
                onClick={() => setGeneratedPrompt(null)}
                className="mt-2 text-xs text-slate-500 hover:text-slate-800 underline"
             >
               Generate New
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
