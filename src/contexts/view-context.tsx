'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ViewType = 
  | 'incubator' 
  | 'controls' 
  | 'water' 
  | 'camera' 
  | 'system' 
  | 'progress' 
  | 'components' 
  | 'history'
  | null;

interface ViewContextType {
  focusedView: ViewType;
  setFocusedView: (view: ViewType) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider = ({ children }: { children: ReactNode }) => {
  const [focusedView, setFocusedView] = useState<ViewType>(null);

  const value = { focusedView, setFocusedView };

  return (
    <ViewContext.Provider value={value}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = (): ViewContextType => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};
