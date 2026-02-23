"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
    buzzerActive: boolean;
    criticalTempAlert: boolean;
  };
  eggType: string;
}

interface IncubatorContextType {
  data: IncubatorData;
  toggleFan: () => void;
  emergencyStop: () => void;
  refillWater: () => void;
  setEggType: (eggType: string) => void;
}

// Initial State
const initialData: IncubatorData = {
  control: {
    heater: false,
    fan: false,
    motor: false,
    humidityControl: false,
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
    buzzerActive: false,
    criticalTempAlert: false,
  },
  eggType: 'Chicken',
};

const IncubatorContext = createContext<IncubatorContextType | undefined>(undefined);

export const IncubatorProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<IncubatorData>(initialData);
  const { toast } = useToast();

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
        const { eggType, ...rest } = initialData;
        set(incubatorRef, rest);
      }
    });
    return () => unsubscribe();
  }, [toast]);
  
  const setControlValue = useCallback((key: string, value: any) => {
    if (!database) return;
    const controlRef = ref(database, `incubator/control/${key}`);
    set(controlRef, value);
  }, []);

  const toggleFan = useCallback(() => setControlValue('fan', !data.control.fan), [setControlValue, data.control.fan]);

  const emergencyStop = useCallback(() => {
    if (!database) return;
    const controlRef = ref(database, 'incubator/control');
    set(controlRef, {
        heater: false,
        fan: false,
        motor: false,
        humidityControl: false,
    });
  }, []);

  const refillWater = useCallback(() => {
    if (!database) return;
    const waterLevelRef = ref(database, 'incubator/sensors/waterLevel');
    set(waterLevelRef, "HIGH");
  }, []);
  
  const setEggType = useCallback((eggType: string) => {
    setData(prev => ({...prev, eggType}));
  }, []);

  const value = { data, toggleFan, emergencyStop, refillWater, setEggType };

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
