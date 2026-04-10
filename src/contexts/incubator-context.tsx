
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { database } from '@/firebase/config';
import { ref, onValue, set, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';

// Data types
export interface AlertSystem {
  status: 'SYSTEM_OK' | 'WARNING' | 'CRITICAL';
  temperatureState: 'NORMAL' | 'HIGH' | 'LOW';
  humidityState: 'NORMAL' | 'HIGH' | 'LOW';
  buzzer: boolean;
  message: string;
}

export interface IncubatorData {
  name?: string;
  status: {
    deviceOnline: boolean;
    wifiConnected: boolean;
  };
  control: {
    heater: boolean;
    fan: boolean;
    motor: boolean;
    cameraOn: boolean;
    targetTemperature: number;
    targetHumidity: number;
  };
  sensors: {
    temperature: number;
    humidity: number;
    waterLevel: string;
    waterPercent: number;
  };
  alertSystem: AlertSystem;
  incubation: {
    eggType: string;
    numberOfEggs: number;
    currentDay: number;
    totalDays: number;
  };
}

interface IncubatorContextType {
  data: IncubatorData;
  isLocked: boolean;
  toggleFan: () => void;
  toggleHeater: () => void;
  toggleMotor: () => void;
  toggleCamera: () => void;
  refillWater: () => void;
  setEggType: (eggType: string) => void;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  setAccessCode: (pin: string) => void;
  setTargetTemperature: (temp: number) => void;
  setTargetHumidity: (humidity: number) => void;
  setSensorTemperature: (temp: number) => void;
  setSensorHumidity: (humidity: number) => void;
  setCurrentDay: (day: number) => void;
  setTotalDays: (days: number) => void;
  resetIncubation: () => void;
  startIncubation: () => void;
  setNumberOfEggs: (count: number) => void;
}

export const EGG_INCUBATION_PERIODS: { [key: string]: number } = {
  Chicken: 21,
  Duck: 28,
  Quail: 18,
  Turkey: 28,
};

// Initial State
export const initialData: IncubatorData = {
  name: "My Incubator",
  status: {
    deviceOnline: true,
    wifiConnected: true,
  },
  control: {
    heater: false,
    fan: false,
    motor: false,
    cameraOn: true,
    targetTemperature: 37.5,
    targetHumidity: 55,
  },
  sensors: {
    temperature: 37.5,
    humidity: 55,
    waterLevel: "HIGH",
    waterPercent: 80,
  },
  alertSystem: {
    status: "SYSTEM_OK",
    temperatureState: "NORMAL",
    humidityState: "NORMAL",
    buzzer: false,
    message: "System stable. Optimal conditions.",
  },
  incubation: {
    eggType: 'Chicken',
    numberOfEggs: 56,
    currentDay: 1,
    totalDays: EGG_INCUBATION_PERIODS['Chicken'],
  },
};

const IncubatorContext = createContext<IncubatorContextType | undefined>(undefined);

export const IncubatorProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [data, setData] = useState<IncubatorData>(initialData);
  const [isLocked, setIsLocked] = useState(true);
  const [accessCode, setAccessCode] = useState('1234'); // Default PIN
  const { toast } = useToast();

  useEffect(() => {
    if (!database || !user) {
      setData(initialData); // Reset to initial if user logs out
      return;
    }
    
    const incubatorRef = ref(database, `incubators/${user.uid}`);
    const unsubscribe = onValue(incubatorRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.val();
        // Deep merge remote data with initialData to prevent crashes from missing fields
        const mergedData = {
          ...initialData,
          ...remoteData,
          control: { ...initialData.control, ...remoteData.control },
          sensors: { ...initialData.sensors, ...remoteData.sensors },
          status: { ...initialData.status, ...remoteData.status },
          alertSystem: { ...initialData.alertSystem, ...remoteData.alertSystem },
          incubation: { ...initialData.incubation, ...remoteData.incubation },
        };
        setData(mergedData);
      } else {
        setData(initialData);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!database || !user || !data.sensors || !data.alertSystem) return;

    const { temperature, humidity } = data.sensors;
    
    const OPTIMAL_TEMP_NORMAL_MIN = 37.0;
    const OPTIMAL_TEMP_NORMAL_MAX = 38.0;
    const OPTIMAL_TEMP_CRITICAL_LOW = 36.5;
    const OPTIMAL_TEMP_CRITICAL_HIGH = 38.5;

    const OPTIMAL_HUMIDITY_NORMAL_MIN = 40;
    const OPTIMAL_HUMIDITY_NORMAL_MAX = 60;
    const OPTIMAL_HUMIDITY_WARNING_LOW = 35;
    const OPTIMAL_HUMIDITY_WARNING_HIGH = 65;
    
    const newAlert: AlertSystem = {
      status: 'SYSTEM_OK',
      temperatureState: 'NORMAL',
      humidityState: 'NORMAL',
      buzzer: false,
      message: 'System stable. Optimal conditions.',
    };

    if (temperature < OPTIMAL_TEMP_CRITICAL_LOW || temperature > OPTIMAL_TEMP_CRITICAL_HIGH) {
      newAlert.status = 'CRITICAL';
      newAlert.temperatureState = temperature < OPTIMAL_TEMP_CRITICAL_LOW ? 'LOW' : 'HIGH';
    } else if (temperature < OPTIMAL_TEMP_NORMAL_MIN || temperature > OPTIMAL_TEMP_NORMAL_MAX) {
      newAlert.status = 'WARNING';
      newAlert.temperatureState = temperature < OPTIMAL_TEMP_NORMAL_MIN ? 'LOW' : 'HIGH';
    }

    if (humidity < OPTIMAL_HUMIDITY_WARNING_LOW || humidity > OPTIMAL_HUMIDITY_WARNING_HIGH) {
      if(newAlert.status !== 'CRITICAL') newAlert.status = 'WARNING';
      newAlert.humidityState = humidity < OPTIMAL_HUMIDITY_WARNING_LOW ? 'LOW' : 'HIGH';
    } else if (humidity < OPTIMAL_HUMIDITY_NORMAL_MIN || humidity > OPTIMAL_HUMIDITY_NORMAL_MAX) {
      if (newAlert.status !== 'CRITICAL') newAlert.status = 'WARNING';
      newAlert.humidityState = humidity < OPTIMAL_HUMIDITY_NORMAL_MIN ? 'LOW' : 'HIGH';
    }

    if (newAlert.status === 'CRITICAL') {
      newAlert.buzzer = true;
      const tempMsg = newAlert.temperatureState !== 'NORMAL' ? `Temp is ${newAlert.temperatureState.toLowerCase()}` : '';
      const humMsg = newAlert.humidityState !== 'NORMAL' ? `Humidity is ${newAlert.humidityState.toLowerCase()}` : '';
      newAlert.message = `CRITICAL: ${[tempMsg, humMsg].filter(Boolean).join(' & ')}. Immediate action required.`;
    } else if (newAlert.status === 'WARNING') {
      newAlert.buzzer = false;
      const tempMsg = newAlert.temperatureState !== 'NORMAL' ? `Temp is ${newAlert.temperatureState.toLowerCase()}` : '';
      const humMsg = newAlert.humidityState !== 'NORMAL' ? `Humidity is ${newAlert.humidityState.toLowerCase()}` : '';
      newAlert.message = `Warning: ${[tempMsg, humMsg].filter(Boolean).join(' & ')}. Conditions are suboptimal.`;
    }

    if (JSON.stringify(newAlert) !== JSON.stringify(data.alertSystem)) {
      const previousStatus = data.alertSystem.status;
      const newStatus = newAlert.status;
      if (newStatus !== previousStatus && (newStatus === 'WARNING' || newStatus === 'CRITICAL')) {
        toast({
            variant: newStatus === 'CRITICAL' ? 'destructive' : 'default',
            title: newStatus === 'CRITICAL' ? 'Critical Alert' : 'System Warning',
            description: newAlert.message,
            duration: 12000,
        });
      }
      const alertSystemRef = ref(database, `incubators/${user.uid}/alertSystem`);
      set(alertSystemRef, newAlert);
    }
  }, [data.sensors, data.alertSystem, user, toast]);

  const getDbPath = useCallback((path: string) => {
    if (!user) return null;
    return `incubators/${user.uid}/${path}`;
  }, [user]);

  const setValue = useCallback((path: string, value: any) => {
    if (isLocked) {
      toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to make changes." });
      return false;
    }
    const fullPath = getDbPath(path);
    if (!database || !fullPath) return false;
    const dbRef = ref(database, fullPath);
    set(dbRef, value);
    return true;
  }, [isLocked, toast, getDbPath]);

  const updateValues = useCallback((updates: object) => {
    if (isLocked) {
      toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to make changes." });
      return;
    }
    const basePath = getDbPath('');
    if (!database || !basePath) return;
    const dbRef = ref(database, basePath);
    update(dbRef, updates);
  }, [isLocked, toast, getDbPath]);

  const toggleFan = useCallback(() => setValue('control/fan', !data.control.fan), [setValue, data.control.fan]);
  const toggleHeater = useCallback(() => setValue('control/heater', !data.control.heater), [setValue, data.control.heater]);
  const toggleMotor = useCallback(() => setValue('control/motor', !data.control.motor), [setValue, data.control.motor]);
  const toggleCamera = useCallback(() => setValue('control/cameraOn', !data.control.cameraOn), [setValue, data.control.cameraOn]);
  const setTargetTemperature = useCallback((temp: number) => setValue('control/targetTemperature', temp), [setValue]);
  const setTargetHumidity = useCallback((humidity: number) => setValue('control/targetHumidity', humidity), [setValue]);
  const setSensorTemperature = useCallback((temp: number) => setValue('sensors/temperature', temp), [setValue]);
  const setSensorHumidity = useCallback((humidity: number) => setValue('sensors/humidity', humidity), [setValue]);

  const refillWater = useCallback(() => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to refill water." }); return; }
    if (data.sensors.waterPercent >= 95) { toast({ title: "Reservoir Full", description: "Water level is already near maximum." }); return; }
    updateValues({ 'sensors/waterLevel': "HIGH", 'sensors/waterPercent': 100 });
    toast({ title: "Water Refilled", description: "The water reservoir has been set to 100%." });
  }, [isLocked, toast, data.sensors.waterPercent, updateValues]);
  
  const setEggType = useCallback((eggType: string) => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to change egg type." }); return; }
    const newTotalDays = EGG_INCUBATION_PERIODS[eggType] || 21;
    updateValues({ 'incubation/eggType': eggType, 'incubation/currentDay': 1, 'incubation/totalDays': newTotalDays });
  }, [isLocked, toast, updateValues]);

  const setCurrentDay = useCallback((day: number) => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to adjust incubation day." }); return; }
    if (day >= 1 && day <= data.incubation.totalDays) {
      setValue('incubation/currentDay', day);
    }
  }, [isLocked, toast, data.incubation.totalDays, setValue]);

  const setTotalDays = (days: number) => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to change incubation duration." }); return; }
    updateValues({ 'incubation/totalDays': days, 'incubation/currentDay': 1 });
  };

  const resetIncubation = useCallback(() => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to reset incubation." }); return; }
    setValue('incubation/currentDay', 1);
    toast({ title: "Incubation Reset", description: `The incubation period has been reset to Day 1.` });
  }, [isLocked, toast, setValue]);

  const startIncubation = useCallback(() => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to start the incubation cycle." }); return; }
    setValue('incubation/currentDay', 1);
    toast({ title: "Incubation Started", description: `A new incubation cycle for ${data.incubation.eggType} eggs has begun.` });
  }, [isLocked, toast, data.incubation.eggType, setValue]);

  const setNumberOfEggs = useCallback((count: number) => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to change the number of eggs." }); return; }
    if (count < 1 || count > 112) { toast({ variant: "destructive", title: "Invalid Egg Count", description: "Number of eggs must be between 1 and 112." }); return; }
    setValue('incubation/numberOfEggs', count);
  }, [isLocked, toast, setValue]);

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

  const value = { data, isLocked, toggleFan, toggleHeater, toggleMotor, toggleCamera, refillWater, setEggType, unlock, lock, setAccessCode, setTargetTemperature, setTargetHumidity, setSensorTemperature, setSensorHumidity, setCurrentDay, setTotalDays, resetIncubation, startIncubation, setNumberOfEggs };

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
