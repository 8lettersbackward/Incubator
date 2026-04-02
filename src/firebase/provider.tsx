'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Database } from 'firebase/database';
import { app, auth, database } from '@/firebase/config';
import { UserProvider } from './auth/use-user';


interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  database: Database | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FirebaseContext.Provider value={{ app, auth, database }}>
      <UserProvider>
        {children}
      </UserProvider>
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
