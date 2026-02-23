"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { database } from '@/firebase/config';
import { ref, onValue, set } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

// Data types
export interface IncubatorData {
  control: {
    heater: boolean;
    fan: boolean;
    motor: boolean;
    humidityControl: boolean;
    accessCode: string;
  };
  sensors: {
    temperature: number;
    humidity: number;
    waterLevel: string;
    eggsTurned: boolean;
  };
  status: {
    deviceOnline: boolean;
    wifiConnected: boolean;
    systemLocked: boolean;
    buzzerActive: boolean;
    criticalTempAlert: boolean;
  };
  eggType: string;
}

interface IncubatorContextType {
  data: IncubatorData;
  isLocked: boolean;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  resetInactivityTimer: () => void;
  toggleFan: () => void;
  emergencyStop: () => void;
  refillWater: () => void;
  setAccessCode: (newCode: string) => void;
  setEggType: (eggType: string) => void;
}

// Initial State
const initialData: IncubatorData = {
  control: {
    heater: false,
    fan: false,
    motor: false,
    humidityControl: false,
    accessCode: "1234",
  },
  sensors: {
    temperature: 0,
    humidity: 0,
    waterLevel: "LOW",
    eggsTurned: false,
  },
  status: {
    deviceOnline: false,
    wifiConnected: false,
    systemLocked: true,
    buzzerActive: false,
    criticalTempAlert: false,
  },
  eggType: 'Chicken',
};

const AUTO_LOCK_TIMEOUT = 30000; // 30 seconds of inactivity

const IncubatorContext = createContext<IncubatorContextType | undefined>(undefined);

export const IncubatorProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<IncubatorData>(initialData);
  const inactivityTimerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const lock = useCallback(() => {
    if (!database) return;
    const systemLockedRef = ref(database, 'incubator/status/systemLocked');
    set(systemLockedRef, true);
    if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (!data.status.systemLocked) {
        inactivityTimerRef.current = setTimeout(lock, AUTO_LOCK_TIMEOUT);
    }
  }, [lock, data.status.systemLocked]);
  
  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    if (!database) return false;
    if (pin === data.control.accessCode) {
        const systemLockedRef = ref(database, 'incubator/status/systemLocked');
        await set(systemLockedRef, false);
        resetInactivityTimer();
        return true;
    }
    return false;
  }, [data.control.accessCode, resetInactivityTimer]);

  useEffect(() => {
    if (!database) {
      toast({
        variant: "destructive",
        title: "Firebase Not Configured",
        description: "Please provide your Firebase credentials in the .env.local file to connect to the database.",
        duration: Infinity,
      });
      return;
    }
    const incubatorRef = ref(database, 'incubator');
    const unsubscribe = onValue(incubatorRef, (snapshot) => {
      if (snapshot.exists()) {
        const dbData = snapshot.val();
        setData(prev => ({
            ...prev,
            control: { ...initialData.control, ...dbData.control },
            sensors: { ...initialData.sensors, ...dbData.sensors },
            status: { ...initialData.status, ...dbData.status },
        }));
      } else {
        set(incubatorRef, {
            control: initialData.control,
            sensors: initialData.sensors,
            status: { ...initialData.status, systemLocked: true },
        });
      }
    });
    return () => unsubscribe();
  }, [toast]);
  
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const setControlValue = useCallback((key: string, value: any) => {
    if (data.status.systemLocked || !database) return;
    const controlRef = ref(database, `incubator/control/${key}`);
    set(controlRef, value);
    resetInactivityTimer();
  }, [data.status.systemLocked, resetInactivityTimer]);

  const toggleFan = useCallback(() => setControlValue('fan', !data.control.fan), [setControlValue, data.control.fan]);

  const emergencyStop = useCallback(() => {
    if (data.status.systemLocked || !database) return;
    const controlRef = ref(database, 'incubator/control');
    set(controlRef, {
        ...data.control,
        heater: false,
        fan: false,
        motor: false,
        humidityControl: false,
    });
    lock(); // Also lock the system
    resetInactivityTimer();
  }, [data.control, data.status.systemLocked, resetInactivityTimer, lock]);

  const refillWater = useCallback(() => {
    if (!database) return;
    const waterLevelRef = ref(database, 'incubator/sensors/waterLevel');
    set(waterLevelRef, "HIGH");
    resetInactivityTimer();
  }, [resetInactivityTimer]);
  
  const setAccessCode = useCallback((newCode: string) => {
    if(data.status.systemLocked || !database) return;
    if (newCode.length === 4 && /^\d+$/.test(newCode)) {
      const accessCodeRef = ref(database, 'incubator/control/accessCode');
      set(accessCodeRef, newCode);
      resetInactivityTimer();
    }
  }, [data.status.systemLocked, resetInactivityTimer]);

  const setEggType = useCallback((eggType: string) => {
    setData(prev => ({...prev, eggType}));
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const value = { data, isLocked: data.status.systemLocked, unlock, lock, resetInactivityTimer, toggleFan, emergencyStop, refillWater, setAccessCode, setEggType };

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
