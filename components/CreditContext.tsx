
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { getUserProfile, updateUserProfile } from '../services/db';

interface CreditContextType {
  credits: number;
  isSubscribed: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  addCredits: (amount: number) => Promise<void>;
  deductCredit: () => Promise<boolean>;
  subscribe: () => Promise<void>;
  toggleAdmin: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await getUserProfile();
      setProfile(p);
    } catch (e) {
      console.error("Failed to load user profile", e);
    } finally {
      setIsLoading(false);
    }
  };

  const addCredits = async (amount: number) => {
    if (!profile) return;
    const newProfile = { ...profile, credits: profile.credits + amount };
    await updateUserProfile(newProfile);
    setProfile(newProfile);
  };

  const deductCredit = async (): Promise<boolean> => {
    if (!profile) return false;
    
    // Admins and Subscribers don't use credits
    if (profile.isAdmin || profile.isSubscribed) return true;

    if (profile.credits > 0) {
      const newProfile = { ...profile, credits: profile.credits - 1 };
      await updateUserProfile(newProfile);
      setProfile(newProfile);
      return true;
    }
    return false;
  };

  const subscribe = async () => {
    if (!profile) return;
    const newProfile = { ...profile, isSubscribed: true };
    await updateUserProfile(newProfile);
    setProfile(newProfile);
  };

  const toggleAdmin = async () => {
    if (!profile) return;
    const newProfile = { ...profile, isAdmin: !profile.isAdmin };
    await updateUserProfile(newProfile);
    setProfile(newProfile);
  };

  return (
    <CreditContext.Provider value={{
      credits: profile?.credits || 0,
      isSubscribed: profile?.isSubscribed || false,
      isAdmin: profile?.isAdmin || false,
      isLoading,
      addCredits,
      deductCredit,
      subscribe,
      toggleAdmin
    }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};
