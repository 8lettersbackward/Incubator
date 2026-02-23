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
    targetTemperature: number;
    targetHumidity: number;
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
  };
  alertSystem: {
    status: 'OK' | 'Warning' | 'Critical';
    message: string;
  };
  eggType: string;
}

interface IncubatorContextType {
  data: IncubatorData;
  isLocked: boolean;
  toggleFan: () => void;
  refillWater: () => void;
  setEggType: (eggType: string) => void;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  setAccessCode: (newPin: string) => void;
  setTargetTemperature: (temp: number) => void;
  setTargetHumidity: (humidity: number) => void;
}

// Initial State
const initialData: IncubatorData = {
  control: {
    heater: false,
    fan: false,
    motor: false,
    humidityControl: false,
    targetTemperature: 37.5,
    targetHumidity: 60,
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
  },
  alertSystem: {
    status: 'OK',
    message: 'Conditions are optimal.',
  },
  eggType: 'Chicken',
};

const IncubatorContext = createContext<IncubatorContextType | undefined>(undefined);

export const IncubatorProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<IncubatorData>(initialData);
  const [isLocked, setIsLocked] = useState(true);
  const [accessCode, setAccessCode] = useState('1234'); // Default PIN
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
            alertSystem: { ...initialData.alertSystem, ...dbData.alertSystem },
        }));
      } else {
        const { eggType, ...rest } = initialData;
        set(incubatorRef, rest);
      }
    });
    return () => unsubscribe();
  }, [toast]);
  
  const setControlValue = useCallback((key: string, value: any) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to make changes.",
      });
      return false;
    }
    if (!database) return false;
    const controlRef = ref(database, `incubator/control/${key}`);
    set(controlRef, value);
    return true;
  }, [isLocked, toast]);

  const toggleFan = useCallback(() => {
    setControlValue('fan', !data.control.fan)
  }, [setControlValue, data.control.fan]);
  
  const setTargetTemperature = useCallback((temp: number) => {
    setControlValue('targetTemperature', temp);
  }, [setControlValue]);

  const setTargetHumidity = useCallback((humidity: number) => {
    setControlValue('targetHumidity', humidity);
  }, [setControlValue]);

  const refillWater = useCallback(() => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to refill water.",
      });
      return;
    }
    if (data.sensors.waterLevel === 'HIGH') {
        toast({
            title: "Reservoir Full",
            description: "Water level is already at maximum.",
        });
        return;
    }
    if (!database) return;
    const waterLevelRef = ref(database, 'incubator/sensors/waterLevel');
    set(waterLevelRef, "HIGH");
     toast({
        title: "Water Refilled",
        description: "The water reservoir has been set to HIGH.",
      });
  }, [isLocked, toast, data.sensors.waterLevel]);
  
  const setEggType = useCallback((eggType: string) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to change egg type.",
      });
      return;
    }
    setData(prev => ({...prev, eggType}));
  }, [isLocked, toast]);

  const unlock = useCallback((pin: string) => {
    return new Promise<boolean>((resolve) => {
      if (pin === accessCode) {
        setIsLocked(false);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }, [accessCode]);

  const lock = useCallback(() => {
    setIsLocked(true);
    toast({
      title: "System Locked",
      description: "Controls are now secured.",
    });
  }, [toast]);

  const value = { data, isLocked, toggleFan, refillWater, setEggType, unlock, lock, setAccessCode, setTargetTemperature, setTargetHumidity };

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
