"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Data types
export interface IncubatorData {
  temperature: number;
  humidity: number;
  isHeaterActive: boolean;
  isFanActive: boolean;
  isTurningMotorActive: boolean;
  waterLevel: number;
  eggType: string;
  wifi: {
    connected: boolean;
    ssid: string;
    ip: string;
    signal: number;
  };
  camera: {
    quality: string;
    fps: number;
    dataUsage: string;
  };
}

interface IncubatorContextType {
  data: IncubatorData;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  toggleHeater: () => void;
  toggleFan: () => void;
  manualTurn: () => void;
  setHumidity: (level: number) => void;
  emergencyStop: () => void;
}

// Initial State
const initialData: IncubatorData = {
  temperature: 37.5,
  humidity: 55,
  isHeaterActive: true,
  isFanActive: false,
  isTurningMotorActive: false,
  waterLevel: 75,
  eggType: 'Chicken',
  wifi: {
    connected: true,
    ssid: 'OvumNet_5G',
    ip: '192.168.1.123',
    signal: 92,
  },
  camera: {
    quality: '1080p',
    fps: 30,
    dataUsage: '2.1 MB/s',
  },
};

const IncubatorContext = createContext<IncubatorContextType | undefined>(undefined);

export const IncubatorProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<IncubatorData>(initialData);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const tempChange = (Math.random() - 0.5) * 0.2;
        const humidityChange = (Math.random() - 0.5) * 1;
        
        let newTemp = prevData.temperature + tempChange;
        if (prevData.isHeaterActive && newTemp < 38.0) newTemp += 0.1;
        if (!prevData.isHeaterActive && newTemp > 37.0) newTemp -= 0.1;
        
        let newHumidity = prevData.humidity + humidityChange;
        if (prevData.isFanActive && newHumidity > 50) newHumidity -= 0.5;
        if (!prevData.isFanActive && newHumidity < 60) newHumidity += 0.5;


        return {
          ...prevData,
          temperature: parseFloat(newTemp.toFixed(1)),
          humidity: Math.max(0, Math.min(100, parseFloat(newHumidity.toFixed(0)))),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => setIsLoggedIn(false), []);

  const toggleHeater = useCallback(() => setData(d => ({ ...d, isHeaterActive: !d.isHeaterActive })), []);
  const toggleFan = useCallback(() => setData(d => ({ ...d, isFanActive: !d.isFanActive })), []);
  
  const manualTurn = useCallback(() => {
    setData(d => ({ ...d, isTurningMotorActive: true }));
    setTimeout(() => {
      setData(d => ({ ...d, isTurningMotorActive: false }));
    }, 5000);
  }, []);

  const setHumidity = useCallback((level: number) => {
    setData(d => ({...d, humidity: level}));
  }, []);
  
  const emergencyStop = useCallback(() => {
    setData(d => ({ ...d, isHeaterActive: false, isFanActive: false, isTurningMotorActive: false }));
  }, []);

  const value = { data, isLoggedIn, login, logout, toggleHeater, toggleFan, manualTurn, setHumidity, emergencyStop };

  return (
    <IncubatorContext.Provider value={value}>
      {children}
    </IncubatorContext.Provider>
  );
};

export const useIncubator = (): IncubatorContextType => {
  const context = useContext(IncubatorContext);
  if (context === undefined) {
    throw new Error('useIncubator must be used within an IncubatorProvider');
  }
  return context;
};
