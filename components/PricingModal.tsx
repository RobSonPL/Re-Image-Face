
import React from 'react';
import { useLanguage } from './LanguageContext';
import { Button } from './Button';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleCheckout = () => {
     alert("Payments are currently disabled.");
  };

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 md:p-8 text-center border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.pricingTitle}</h2>
          <p className="text-slate-500 max-w-md mx-auto">{t.pricingDesc}</p>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8 bg-slate-50/50">
          
          {/* Card 1: Pay Per Photo */}
          <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-200 transition-colors flex flex-col relative opacity-60">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">{t.payPerPhoto}</h3>
              <p className="text-sm text-slate-500">{t.payPerPhotoDesc}</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-slate-900">{t.priceCredit}</span>
              <span className="text-slate-500 text-sm font-medium"> {t.perPhoto}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
               <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckIcon /> {t.creditPack}
               </li>
               <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckIcon /> {t.feature1}
               </li>
               <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckIcon /> {t.feature3}
               </li>
            </ul>
            <Button 
              variant="secondary" 
              onClick={handleCheckout}
              className="w-full"
            >
              {t.buyCredits}
            </Button>
          </div>

          {/* Card 2: Subscription */}
          <div className="bg-white rounded-xl p-6 border-2 border-indigo-600 shadow-xl shadow-indigo-100 flex flex-col relative scale-[1.02] opacity-60">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
               {t.bestValue}
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 {t.subscription}
                 <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full">PRO</span>
              </h3>
              <p className="text-sm text-slate-500">{t.subscriptionDesc}</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-slate-900">{t.priceSub}</span>
              <span className="text-slate-500 text-sm font-medium"> {t.perMonth}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
               <li className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                  <CheckIcon /> {t.unlimited}
               </li>
               <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckIcon /> {t.feature2}
               </li>
               <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckIcon /> {t.feature4}
               </li>
               <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckIcon /> {t.feature1}
               </li>
            </ul>
            <Button 
              variant="primary" 
              onClick={handleCheckout}
              className="w-full"
            >
              {t.subscribeBtn}
            </Button>
          </div>

        </div>
        
        <div className="p-4 bg-slate-50 text-center border-t border-slate-200">
           <p className="text-xs text-slate-400">
             PAYMENTS DISABLED TEMPORARILY
           </p>
        </div>
      </div>
    </div>
  );
};
