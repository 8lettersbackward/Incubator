"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { database } from '@/firebase/config';
import { ref, onValue, set, get } from 'firebase/database';

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
    isOn: boolean;
    quality: string;
    fps: number;
    dataUsage: string;
  };
}

interface IncubatorContextType {
  data: IncubatorData;
  isLocked: boolean;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  resetInactivityTimer: () => void;
  toggleHeater: () => void;
  toggleFan: () => void;
  manualTurn: () => void;
  setHumidity: (level: number) => void;
  emergencyStop: () => void;
  refillWater: () => void;
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
    isOn: true,
    quality: '1080p',
    fps: 30,
    dataUsage: '2.1 MB/s',
  },
};

const AUTO_LOCK_TIMEOUT = 30000; // 30 seconds of inactivity

const IncubatorContext = createContext<IncubatorContextType | undefined>(undefined);

export const IncubatorProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<IncubatorData>(initialData);
  const [isLocked, setIsLocked] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout>();

  const lock = useCallback(() => {
    setIsLocked(true);
    if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(lock, AUTO_LOCK_TIMEOUT);
  }, [lock]);
  
  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const accessCodeRef = ref(database, 'incubator/control/accessCode');
    try {
        const snapshot = await get(accessCodeRef);
        const correctPin = snapshot.val();

        if (pin === String(correctPin)) {
          setIsLocked(false);
          resetInactivityTimer();
          return true;
        }
        return false;
    } catch (error) {
        console.error("Error fetching access code:", error);
        return false;
    }
  }, [resetInactivityTimer]);

  useEffect(() => {
    const controlRef = ref(database, 'incubator/control');
    const sensorsRef = ref(database, 'incubator/sensors');

    const unsubscribeControl = onValue(controlRef, (snapshot) => {
        const controlData = snapshot.val();
        if (controlData) {
            setData(prevData => ({
                ...prevData,
                isHeaterActive: controlData.heater ?? prevData.isHeaterActive,
                isFanActive: controlData.fan ?? prevData.isFanActive,
                isTurningMotorActive: controlData.motor ?? prevData.isTurningMotorActive,
            }));
        }
    });

    const unsubscribeSensors = onValue(sensorsRef, (snapshot) => {
        const sensorData = snapshot.val();
        if (sensorData) {
            setData(prevData => ({
                ...prevData,
                temperature: sensorData.temperature ?? prevData.temperature,
                humidity: sensorData.humidity ?? prevData.humidity,
                waterLevel: sensorData.waterLevel ?? prevData.waterLevel,
            }));
        }
    });

    return () => {
        unsubscribeControl();
        unsubscribeSensors();
    };
  }, []);

  useEffect(() => {
    // Cleanup timer on component unmount
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const handleInteraction = (action: () => void) => {
    if (!isLocked) {
        action();
        resetInactivityTimer();
    }
  };

  const toggleHeater = useCallback(() => {
    if (isLocked) return;
    const heaterRef = ref(database, 'incubator/control/heater');
    set(heaterRef, !data.isHeaterActive);
    resetInactivityTimer();
  }, [data.isHeaterActive, isLocked, resetInactivityTimer]);

  const toggleFan = useCallback(() => {
    if (isLocked) return;
    const fanRef = ref(database, 'incubator/control/fan');
    set(fanRef, !data.isFanActive);
    resetInactivityTimer();
  }, [data.isFanActive, isLocked, resetInactivityTimer]);
  
  const manualTurn = useCallback(() => {
    if (isLocked) return;
    const motorRef = ref(database, 'incubator/control/motor');
    set(motorRef, true);
    setTimeout(() => {
      set(motorRef, false);
    }, 5000);
    resetInactivityTimer();
  }, [isLocked, resetInactivityTimer]);

  const setHumidity = useCallback((level: number) => {
    if (isLocked) return;
    const humidityRef = ref(database, 'incubator/sensors/humidity');
    set(humidityRef, level);
    resetInactivityTimer();
  }, [isLocked, resetInactivityTimer]);
  
  const emergencyStop = useCallback(() => {
    if (isLocked) return;
    const heaterRef = ref(database, 'incubator/control/heater');
    set(heaterRef, false);
    const fanRef = ref(database, 'incubator/control/fan');
    set(fanRef, false);
    const motorRef = ref(database, 'incubator/control/motor');
    set(motorRef, false);
    resetInactivityTimer();
  }, [isLocked, resetInactivityTimer]);

  const refillWater = useCallback(() => {
    const waterLevelRef = ref(database, 'incubator/sensors/waterLevel');
    set(waterLevelRef, 100);
  }, []);

  const value = { data, isLocked, lock, unlock, resetInactivityTimer, toggleHeater, toggleFan, manualTurn, setHumidity, emergencyStop, refillWater };

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
