
import React, { useState, useCallback, useEffect } from 'react';
import { HeadshotStyle, GenerationState, Project, BackgroundId } from './types';
import { STYLES, BACKGROUNDS } from './constants';
import { generateHeadshot, resizeImage } from './services/geminiService';
import { saveProject, getProjects, deleteProject } from './services/db';
import { Button } from './components/Button';
import { ComparisonSlider } from './components/ComparisonSlider';
import { UploadSection } from './components/UploadSection';
import { DownloadOptions } from './components/DownloadOptions';
import { HistoryGallery } from './components/HistoryGallery';
import { StyleComparisonModal } from './components/StyleComparisonModal';
import { BackgroundSelector } from './components/BackgroundSelector';
import { PresetBuilder } from './components/PresetBuilder';
import { savePreset, getPresets } from './services/db';
import { CustomPreset } from './types';
import { VeoPromptGenerator } from './components/VeoPromptGenerator';
import { useLanguage } from './components/LanguageContext';
import { useCredits } from './components/CreditContext';
import { PricingModal } from './components/PricingModal';

const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  // Payments disabled: isAdmin/credits logic kept for UI display only, but not enforced
  const { credits, isSubscribed, isAdmin, toggleAdmin } = useCredits();
  
  const [selectedStyle, setSelectedStyle] = useState<HeadshotStyle>(HeadshotStyle.CORPORATE);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundId>(BackgroundId.ORIGINAL);
  const [state, setState] = useState<GenerationState>({
    originalImage: null,
    generatedImage: null,
    generatedVideo: null,
    isGenerating: false,
    error: null,
  });

  // Preview State
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});

  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Compare Modal State
  const [showCompare, setShowCompare] = useState(false);

  // Presets State
  const [showPresetBuilder, setShowPresetBuilder] = useState(false);
  const [presets, setPresets] = useState<CustomPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  
  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Pricing State
  const [showPricing, setShowPricing] = useState(false);

  // Admin Toggle Logic
  const [adminClickCount, setAdminClickCount] = useState(0);

  // Load history & presets on mount
  useEffect(() => {
    loadProjects();
    loadPresets();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const loadPresets = async () => {
    try {
      const data = await getPresets();
      setPresets(data);
      // Auto-select first preset if available
      if (data.length > 0) {
        setSelectedPresetId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load presets", err);
    }
  };

  const handleTitleClick = () => {
    // Secret admin toggle: 5 rapid clicks
    setAdminClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        toggleAdmin();
        return 0;
      }
      // Reset after 1 second if no more clicks
      setTimeout(() => setAdminClickCount(0), 1000);
      return newCount;
    });
    // Standard reset behavior
    reset();
  };

  const handleImageSelect = useCallback((base64: string) => {
    setState(prev => ({
      ...prev,
      originalImage: base64,
      generatedImage: null,
      generatedVideo: null,
      error: null
    }));
    // Reset previews on new image upload
    setPreviews({});
    setPreviewLoading({});
  }, []);

  const handlePreview = async (styleId: HeadshotStyle) => {
    if (!state.originalImage) return;
    
    setPreviewLoading(prev => ({ ...prev, [styleId]: true }));
    
    try {
      // Create a small version for preview to be efficient (300px, 0.7 quality)
      const smallImage = await resizeImage(state.originalImage, 300, 0.7);
      const styleConfig = STYLES[styleId];
      
      const result = await generateHeadshot(smallImage, styleConfig.promptModifier + " Close-up face, quick preview.");
      
      setPreviews(prev => ({ ...prev, [styleId]: result }));
    } catch (err) {
      console.error("Preview generation failed", err);
    } finally {
      setPreviewLoading(prev => ({ ...prev, [styleId]: false }));
    }
  };

  const handleBatchPreviews = async (styleIds: HeadshotStyle[]) => {
     // Trigger multiple previews
     styleIds.forEach(id => handlePreview(id));
  };

  const handleGenerate = async () => {
    if (!state.originalImage) return;

    // PAYMENTS DISABLED: No credit check here anymore.
    
    setState(prev => ({ ...prev, isGenerating: true, error: null, generatedVideo: null }));

    try {
      let prompt = "";
      
      // Determine base style prompt
      if (selectedPresetId) {
        const preset = presets.find(p => p.id === selectedPresetId);
        if (preset) {
           const styleNames = preset.styles.map(s => STYLES[s].title).join(" + ");
           const combinedModifiers = preset.styles.map(s => STYLES[s].promptModifier).join(" ");
           prompt = `Transform this person into a hybrid style of ${styleNames}. ${combinedModifiers}`;
        }
      } else {
        const styleConfig = STYLES[selectedStyle];
        prompt = styleConfig.promptModifier;
      }

      // Append Background Prompt if not 'ORIGINAL'
      if (selectedBackground !== BackgroundId.ORIGINAL) {
         const bgConfig = BACKGROUNDS.find(b => b.id === selectedBackground);
         if (bgConfig && bgConfig.promptModifier) {
            prompt += ` ${bgConfig.promptModifier} Ignore previous background details.`;
         }
      }

      const result = await generateHeadshot(state.originalImage, prompt);
      
      // PAYMENTS DISABLED: No credit deduction here anymore.

      setState(prev => ({
        ...prev,
        generatedImage: result,
        isGenerating: false
      }));

      // Auto-save to history
      await saveProject({
        timestamp: Date.now(),
        style: selectedPresetId ? HeadshotStyle.CORPORATE : selectedStyle, // Fallback style ID for preset
        originalImage: state.originalImage,
        generatedImage: result
      });
      await loadProjects(); // Refresh list

    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err.message || "Failed to generate headshot. Please try again."
      }));
    }
  };

  const reset = () => {
    setState({
      originalImage: null,
      generatedImage: null,
      generatedVideo: null,
      isGenerating: false,
      error: null
    });
    setPreviews({});
    setPreviewLoading({});
  };

  const loadFromHistory = (project: Project) => {
    setState({
      originalImage: project.originalImage,
      generatedImage: project.generatedImage,
      generatedVideo: null,
      isGenerating: false,
      error: null
    });
    setSelectedStyle(project.style);
    setShowHistory(false);
  };

  const handleDeleteProject = async (id: number) => {
    await deleteProject(id);
    await loadProjects();
  };

  const handleSavePreset = async (name: string, styles: HeadshotStyle[]) => {
     await savePreset({
       id: crypto.randomUUID(),
       name,
       styles,
       createdAt: Date.now()
     });
     await loadPresets();
     setShowPresetBuilder(false);
  };

  const renderStyleIcon = (id: HeadshotStyle) => {
     // Helper to render inline SVG icons
     switch(id) {
       case HeadshotStyle.CORPORATE: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
       case HeadshotStyle.CREATIVE: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
       case HeadshotStyle.EXECUTIVE: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
       case HeadshotStyle.SEXY: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
       case HeadshotStyle.SENSUAL: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
       case HeadshotStyle.EROTIC: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>;
       case HeadshotStyle.MEDITATION: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
       case HeadshotStyle.GLAMOROUS: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
       case HeadshotStyle.VINTAGE: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
       case HeadshotStyle.FUTURISTIC: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
       case HeadshotStyle.CYBERPUNK: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
       case HeadshotStyle.ART_DECO: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
       case HeadshotStyle.FANTASY: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
       case HeadshotStyle.SCIFI: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
       case HeadshotStyle.STEAMPUNK: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
       case HeadshotStyle.THREED: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
       case HeadshotStyle.ICE_AGE: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0 0l-2-2m2 2l2-2M12 3l-2 2m2-2l2 2M4.929 4.929l14.142 14.142M4.929 4.929l2 2m-2-2l2-2M19.071 19.071l-2-2m2 2l-2-2M19.071 4.929L4.929 19.071M19.071 4.929l-2 2m2-2l-2-2M4.929 19.071l2-2m-2 2l2 2" /></svg>;
       case HeadshotStyle.ARTISTIC_PAINTING: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /><circle cx="15" cy="15" r="3" /></svg>;
       default: return null;
     }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleTitleClick}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isAdmin ? 'bg-amber-500' : 'bg-indigo-600'}`}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">{t.title}</h1>
          </div>
          <div className="flex gap-4 items-center">
            
            {/* Credit Display - Now just static for UI purpose, clickable only to show modal but no effect */}
            <div 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isAdmin ? 'bg-amber-100 text-amber-700' :
                isSubscribed ? 'bg-indigo-100 text-indigo-700' : 
                'bg-slate-100 text-slate-600' 
              }`}
            >
               {isAdmin ? (
                 <>
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                   {t.adminPlan}
                 </>
               ) : (
                 <>
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.963 6 10 6c.049 0 .805.208 1.277 1.004l1.1 1.847 1.621 1.621c.712.713.75 1.902-.092 2.744-.593.592-1.42.735-2.09.432-.416.786-1.155 1.352-2.116 1.352-.924 0-1.644-.52-2.073-1.254-.7.317-1.56.17-2.193-.463-.888-.888-.853-2.14.004-2.898l1.716-1.516.92-1.859z" /></svg>
                   {credits} {t.credits}
                 </>
               )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs font-bold">
               <button 
                 onClick={() => setLanguage('pl')} 
                 className={`px-2 py-1 rounded ${language === 'pl' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
               >
                 PL
               </button>
               <button 
                 onClick={() => setLanguage('en')} 
                 className={`px-2 py-1 rounded ${language === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
               >
                 EN
               </button>
            </div>

             <button 
                onClick={() => setShowHistory(true)}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg"
             >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span className="hidden sm:inline">{t.history}</span>
             </button>
             {state.originalImage && (
               <button 
                onClick={reset}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
               >
                 {t.newPhoto}
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Hero / Intro */}
        {!state.originalImage && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {t.heroTitle} <br/>
              <span className="text-indigo-600">{t.heroSubtitle}</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              {t.heroDesc}
            </p>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 relative">
          
          {/* Left Column: Visuals (Sticky) */}
          <div className={`lg:order-2 ${!state.originalImage ? '' : ''}`}>
             <div className="sticky top-24 transition-all duration-300">
               {!state.originalImage ? (
                  <div className="max-w-xl mx-auto">
                      <UploadSection onImageSelect={handleImageSelect} />
                  </div>
               ) : (
                  <div className="w-full">
                    {state.generatedImage ? (
                      <div className="animate-in fade-in zoom-in duration-500">
                        <div 
                           className="cursor-zoom-in"
                           onClick={() => setIsLightboxOpen(true)}
                           title="Click to enlarge"
                        >
                           <ComparisonSlider 
                             beforeImage={state.originalImage} 
                             afterImage={state.generatedImage} 
                           />
                        </div>
                        <DownloadOptions imageUrl={state.generatedImage} />
                        
                        {/* Veo Prompt Generator */}
                        <VeoPromptGenerator sourceImage={state.generatedImage} />
                      </div>
                    ) : (
                      <>
                        <div className="relative w-full aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden shadow-xl bg-slate-100 mb-8">
                          <img 
                            src={state.originalImage} 
                            alt="Original" 
                            className="w-full h-full object-cover" 
                          />
                          {state.isGenerating && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                              <p className="text-slate-800 font-semibold animate-pulse">{t.designing}</p>
                            </div>
                          )}
                        </div>

                        {/* Generate Button Moved Here */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{t.step2}</h3>
                          <p className="text-slate-500 mb-6">{t.step2Desc}</p>
                          
                          {state.error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                              {state.error}
                            </div>
                          )}

                          <Button 
                            variant="primary" 
                            className="w-full h-14 text-lg" 
                            onClick={handleGenerate}
                            isLoading={state.isGenerating}
                            disabled={!state.originalImage}
                          >
                            {isAdmin ? t.generateBtn.replace('1 Credit', 'Admin') : isSubscribed ? t.generateFree : t.generateBtn}
                          </Button>
                          <p className="text-xs text-center text-slate-400 mt-3">
                            {t.generateTerms}
                          </p>
                        </div>
                      </>
                    )}
                 </div>
               )}
             </div>
          </div>

          {/* Right Column: Controls */}
          <div className={`lg:order-1 ${!state.originalImage ? 'hidden lg:block opacity-50 pointer-events-none blur-sm' : ''}`}>
             <div className="bg-white rounded-3xl p-1 md:p-8">
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{t.step1}</h3>
                    <p className="text-slate-500">{t.step1Desc}</p>
                  </div>
                  {state.originalImage && (
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setShowPresetBuilder(true)}
                         className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                         {t.mixStyles}
                       </button>
                       <button 
                        onClick={() => setShowCompare(true)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                        {t.compare}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Presets List */}
                {presets.length > 0 && (
                   <div className="mb-6">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.myMixes}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {presets.map(preset => (
                          <div 
                            key={preset.id}
                            onClick={() => {
                              setSelectedPresetId(selectedPresetId === preset.id ? null : preset.id);
                              // Reset standard style selection if preset selected
                              if (selectedPresetId !== preset.id) setSelectedStyle(HeadshotStyle.CORPORATE); // Dummy default
                            }}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedPresetId === preset.id
                              ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/20'
                              : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <h5 className="font-bold text-slate-900 text-sm">{preset.name}</h5>
                            <p className="text-[10px] text-slate-500 mt-1 truncate">
                              {preset.styles.map(s => t.styles[s]?.title || STYLES[s].title).join(' + ')}
                            </p>
                          </div>
                        ))}
                      </div>
                   </div>
                )}

                {/* Standard Styles Grid */}
                <div className={`grid grid-cols-1 gap-4 mb-8 ${selectedPresetId ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                  {Object.values(STYLES).map((style) => (
                    <div 
                      key={style.id}
                      onClick={() => !state.isGenerating && setSelectedStyle(style.id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedStyle === style.id 
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/20' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      } ${state.isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 ${previews[style.id] ? '' : style.iconColor}`}>
                           {previews[style.id] ? (
                             <img src={previews[style.id]} alt="Preview" className="w-full h-full object-cover animate-in fade-in" />
                           ) : previewLoading[style.id] ? (
                             <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
                           ) : renderStyleIcon(style.id)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900">{t.styles[style.id]?.title || style.title}</h4>
                            {selectedStyle === style.id && (
                              <div className="text-indigo-600">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t.styles[style.id]?.desc || style.description}</p>
                          
                          {state.originalImage && !previews[style.id] && !previewLoading[style.id] && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); handlePreview(style.id); }}
                               className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-2 py-1 -ml-2 rounded hover:bg-indigo-50 transition-colors"
                             >
                               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                               {t.previewLook}
                             </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Background Selector */}
                <BackgroundSelector 
                   selectedBackgroundId={selectedBackground} 
                   onSelect={setSelectedBackground}
                />
                
             </div>
          </div>
        </div>

        {/* History Gallery Overlay */}
        {showHistory && (
          <HistoryGallery 
            projects={projects}
            onSelect={loadFromHistory}
            onClose={() => setShowHistory(false)}
            onDelete={handleDeleteProject}
          />
        )}

        {/* Comparison Modal */}
        <StyleComparisonModal 
          isOpen={showCompare}
          onClose={() => setShowCompare(false)}
          originalImage={state.originalImage}
          previews={previews}
          previewLoading={previewLoading}
          onGeneratePreviews={handleBatchPreviews}
          onSelectStyle={(id) => {
            setSelectedStyle(id);
            // Optionally scroll to generate button?
          }}
        />

        {/* Preset Builder Modal */}
        <PresetBuilder 
          isOpen={showPresetBuilder}
          onClose={() => setShowPresetBuilder(false)}
          onSave={handleSavePreset}
        />
        
        {/* Pricing Modal */}
        <PricingModal 
          isOpen={showPricing}
          onClose={() => setShowPricing(false)}
        />

        {/* Lightbox Modal */}
        {isLightboxOpen && state.generatedImage && (
           <div 
             className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
             onClick={() => setIsLightboxOpen(false)}
           >
              <div className="relative w-full h-full max-w-7xl max-h-screen flex items-center justify-center">
                 <img 
                   src={state.generatedImage} 
                   alt="Full Size" 
                   className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                   onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                 />
                 <button 
                   onClick={() => setIsLightboxOpen(false)}
                   className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
                 >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
