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
    cameraOn: boolean;
    wifiConnected: boolean;
  };
  sensors: {
    temperature: number;
    humidity: number;
    waterLevel: string;
    waterPercent: number;
    eggsTurned: boolean;
  };
  eggType: string;
  incubationDay: number;
}

interface IncubatorContextType {
  data: IncubatorData;
  isLocked: boolean;
  totalIncubationDays: number;
  toggleFan: () => void;
  toggleHeater: () => void;
  toggleMotor: () => void;
  toggleCamera: () => void;
  toggleWifi: () => void;
  refillWater: () => void;
  setEggType: (eggType: string) => void;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  setAccessCode: (pin: string) => void;
  setTargetTemperature: (temp: number) => void;
  setTargetHumidity: (humidity: number) => void;
  setIncubationDay: (day: number) => void;
  setTotalIncubationDays: (days: number) => void;
}

const EGG_INCUBATION_PERIODS: { [key: string]: number } = {
  Chicken: 21,
  Duck: 28,
  Quail: 18,
  Turkey: 28,
};

// Initial State
const initialData: IncubatorData = {
  control: {
    heater: false,
    fan: false,
    motor: false,
    humidityControl: false,
    targetTemperature: 37.5,
    targetHumidity: 60,
    cameraOn: true,
    wifiConnected: true,
  },
  sensors: {
    temperature: 0,
    humidity: 0,
    waterLevel: "LOW",
    waterPercent: 0,
    eggsTurned: false,
  },
  eggType: 'Chicken',
  incubationDay: 1,
};

const IncubatorContext = createContext<IncubatorContextType | undefined>(undefined);

export const IncubatorProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<IncubatorData>(initialData);
  const [isLocked, setIsLocked] = useState(true);
  const [accessCode, setAccessCode] = useState('1234'); // Default PIN
  const { toast } = useToast();
  const [totalIncubationDays, setTotalIncubationDaysState] = useState(EGG_INCUBATION_PERIODS[initialData.eggType]);

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
            control: { ...prev.control, ...dbData.control },
            sensors: { ...prev.sensors, ...dbData.sensors },
        }));
      } else {
        const { eggType, incubationDay, ...rest } = initialData;
        set(incubatorRef, rest);
      }
    });
    return () => unsubscribe();
  }, [toast]);
  
  useEffect(() => {
    setTotalIncubationDaysState(EGG_INCUBATION_PERIODS[data.eggType] || 21);
  }, [data.eggType]);

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

  const toggleHeater = useCallback(() => {
    setControlValue('heater', !data.control.heater);
  }, [setControlValue, data.control.heater]);

  const toggleMotor = useCallback(() => {
    setControlValue('motor', !data.control.motor);
  }, [setControlValue, data.control.motor]);

  const toggleCamera = useCallback(() => {
    setControlValue('cameraOn', !data.control.cameraOn);
  }, [setControlValue, data.control.cameraOn]);

  const toggleWifi = useCallback(() => {
    setControlValue('wifiConnected', !data.control.wifiConnected);
  }, [setControlValue, data.control.wifiConnected]);
  
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
    if (data.sensors.waterPercent >= 95) {
        toast({
            title: "Reservoir Full",
            description: "Water level is already near maximum.",
        });
        return;
    }
    if (!database) return;
    
    const waterLevelRef = ref(database, 'incubator/sensors/waterLevel');
    set(waterLevelRef, "HIGH");

    const waterPercentRef = ref(database, 'incubator/sensors/waterPercent');
    set(waterPercentRef, 100);

     toast({
        title: "Water Refilled",
        description: "The water reservoir has been set to 100%.",
      });
  }, [isLocked, toast, data.sensors.waterPercent]);
  
  const setEggType = useCallback((eggType: string) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to change egg type.",
      });
      return;
    }
    setData(prev => ({...prev, eggType, incubationDay: 1}));
  }, [isLocked, toast]);

  const setIncubationDay = useCallback((day: number) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to adjust incubation day.",
      });
      return;
    }
    if (day >= 1 && day <= totalIncubationDays) {
      setData(prev => ({ ...prev, incubationDay: day }));
    }
  }, [isLocked, toast, totalIncubationDays]);

  const setTotalIncubationDays = (days: number) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to change incubation duration.",
      });
      return;
    }
    setTotalIncubationDaysState(days);
    setData(prev => ({ ...prev, incubationDay: 1 }));
  };

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

  const value = { data, isLocked, totalIncubationDays, toggleFan, toggleHeater, toggleMotor, toggleCamera, toggleWifi, refillWater, setEggType, unlock, lock, setAccessCode, setTargetTemperature, setTargetHumidity, setIncubationDay, setTotalIncubationDays };

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
