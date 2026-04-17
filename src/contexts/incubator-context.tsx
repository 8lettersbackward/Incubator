
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
    accessCode: string;
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
    isIncubating: boolean;
    liveFeedUrl?: string;
    cameraLog?: { id: number; timestamp: string; image: string; event: string; }[];
  };
}

interface IncubatorContextType {
  data: IncubatorData;
  isLocked: boolean;
  toggleFan: () => void;
  toggleHeater: () => void;
  toggleMotor: () => void;
  toggleCamera: (checked: boolean) => void;
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
  toggleIncubation: () => void;
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
    targetTemperature: 35.0,
    targetHumidity: 50,
    accessCode: "",
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
    isIncubating: false,
    liveFeedUrl: '',
    cameraLog: [],
  },
};

const IncubatorContext = createContext<IncubatorContextType | undefined>(undefined);

export const IncubatorProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [data, setData] = useState<IncubatorData>(initialData);
  const [isLocked, setIsLocked] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // On initial mount for a user, ensure the buzzer is reset to OFF.
    // This prevents the alarm from sounding immediately if the app was closed
    // in a critical state. The alert-checking logic will then determine
    // if it needs to be turned on again.
    if (database && user) {
      const buzzerRef = ref(database, `incubators/${user.uid}/alertSystem/buzzer`);
      set(buzzerRef, false);
    }
  }, [user]);

  useEffect(() => {
    if (!database || !user) {
      setData(initialData); // Reset to initial if user logs out
      return;
    }
    
    const incubatorRef = ref(database, `incubators/${user.uid}`);
    const unsubscribe = onValue(incubatorRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.val() || {};
        // Deep merge remote data with initialData to prevent crashes from missing fields
        const mergedData = {
          ...initialData,
          ...remoteData,
          control: { ...initialData.control, ...(remoteData.control || {}) },
          sensors: { ...initialData.sensors, ...(remoteData.sensors || {}) },
          status: { ...initialData.status, ...(remoteData.status || {}) },
          alertSystem: { ...initialData.alertSystem, ...(remoteData.alertSystem || {}) },
          incubation: { ...initialData.incubation, ...(remoteData.incubation || {}) },
        };
        setData(mergedData);
      } else {
        setData(initialData);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!database || !user || !data.sensors || !data.control) return;

    const { temperature, humidity } = data.sensors;
    const { targetTemperature, targetHumidity } = data.control;
    const currentAlert = data.alertSystem;

    const TEMP_ALERT_DEVIATION = 5.0;
    const HUMIDITY_ALERT_DEVIATION = 20;

    const newAlert: AlertSystem = {
      status: 'SYSTEM_OK',
      temperatureState: 'NORMAL',
      humidityState: 'NORMAL',
      buzzer: false,
      message: 'System stable. Optimal conditions.',
    };

    let messages: string[] = [];

    // Check Temperature Deviation
    const tempDiff = temperature - targetTemperature;
    if (Math.abs(tempDiff) > TEMP_ALERT_DEVIATION) {
      newAlert.status = 'CRITICAL';
      newAlert.temperatureState = tempDiff > 0 ? 'HIGH' : 'LOW';
      messages.push(`Temp is ${newAlert.temperatureState.toLowerCase()}`);
    }

    // Check Humidity Deviation
    const humidityDiff = humidity - targetHumidity;
    if (Math.abs(humidityDiff) > HUMIDITY_ALERT_DEVIATION) {
      if (newAlert.status !== 'CRITICAL') {
        newAlert.status = 'CRITICAL';
      }
      newAlert.humidityState = humidityDiff > 0 ? 'HIGH' : 'LOW';
      messages.push(`Humidity is ${newAlert.humidityState.toLowerCase()}`);
    }

    // Construct message based on state
    if (newAlert.status === 'CRITICAL') {
      newAlert.buzzer = true;
      newAlert.message = `CRITICAL: ${messages.join(' & ')}.`;
    }

    // Only update if the alert state has actually changed to prevent loops
    if (JSON.stringify(newAlert) !== JSON.stringify(currentAlert)) {
      const previousStatus = currentAlert?.status;
      const newStatus = newAlert.status;

      // Send a toast notification when a new critical state is entered
      if (newStatus === 'CRITICAL' && previousStatus !== 'CRITICAL') {
        toast({
            variant: 'destructive',
            title: 'Critical Alert',
            description: newAlert.message,
            duration: 12000,
        });
      }
      
      const alertSystemRef = ref(database, `incubators/${user.uid}/alertSystem`);
      set(alertSystemRef, newAlert);
    }
  }, [data.sensors.temperature, data.sensors.humidity, data.control.targetTemperature, data.control.targetHumidity, user, toast, data.alertSystem]);

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
  
  const toggleCamera = useCallback((checked: boolean) => {
    if (isLocked) {
      toast({ variant: "destructive", title: "System Locked", description: "Unlock to use the camera." });
      return;
    }
    
    if (checked) { // Toggling ON - take a snapshot
      const updates: any = {};
      const newSnapshotUrl = `https://picsum.photos/seed/${Date.now()}/600/400`;

      // Archive the current image if it exists
      if (data.incubation.liveFeedUrl) {
        const newLogEntry = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          image: data.incubation.liveFeedUrl,
          event: "Snapshot Archived",
        };
        // Prepend to the log
        const currentLog = data.incubation.cameraLog;
        const logAsArray = currentLog ? (Array.isArray(currentLog) ? currentLog : Object.values(currentLog)) : [];
        const newCameraLog = [newLogEntry, ...logAsArray];
        updates['incubation/cameraLog'] = newCameraLog;
      }
      
      updates['incubation/liveFeedUrl'] = newSnapshotUrl;
      updates['control/cameraOn'] = true;
      
      updateValues(updates);
      toast({
        title: "Snapshot Captured",
        description: "A new image has been taken.",
      });

    } else { // Toggling OFF
      setValue('control/cameraOn', false);
    }
  }, [isLocked, toast, data.incubation.liveFeedUrl, data.incubation.cameraLog, updateValues, setValue]);

  const setTargetTemperature = useCallback((temp: number) => setValue('control/targetTemperature', temp), [setValue]);
  const setTargetHumidity = useCallback((humidity: number) => setValue('control/targetHumidity', humidity), [setValue]);
  const setSensorTemperature = useCallback((temp: number) => setValue('sensors/temperature', temp), [setValue]);
  const setSensorHumidity = useCallback((humidity: number) => setValue('sensors/humidity', humidity), [setValue]);

  
  const setEggType = useCallback((eggType: string) => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to change egg type." }); return; }
    if (data.incubation.isIncubating) { toast({ variant: "destructive", title: "Cycle Active", description: "Cannot change egg type during an active incubation cycle." }); return; }
    const newTotalDays = EGG_INCUBATION_PERIODS[eggType] || 21;
    updateValues({ 'incubation/eggType': eggType, 'incubation/currentDay': 1, 'incubation/totalDays': newTotalDays });
  }, [isLocked, toast, updateValues, data.incubation.isIncubating]);

  const setCurrentDay = useCallback((day: number) => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to adjust incubation day." }); return; }
    if (!data.incubation.isIncubating) { toast({ variant: "destructive", title: "Not Incubating", description: "You can only adjust the day during an active cycle." }); return; }
    if (day >= 1 && day <= data.incubation.totalDays) {
      setValue('incubation/currentDay', day);
    }
  }, [isLocked, toast, data.incubation.totalDays, setValue, data.incubation.isIncubating]);

  const setTotalDays = (days: number) => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to change incubation duration." }); return; }
    if (data.incubation.isIncubating) { toast({ variant: "destructive", title: "Cycle Active", description: "Cannot change duration during an active incubation cycle." }); return; }
    updateValues({ 'incubation/totalDays': days, 'incubation/currentDay': 1 });
  };

  const resetIncubation = useCallback(() => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to reset incubation." }); return; }
    if (!data.incubation.isIncubating) { toast({ variant: "destructive", title: "Not Incubating", description: "Start an incubation cycle to reset." }); return; }
    setValue('incubation/currentDay', 1);
    toast({ title: "Incubation Reset", description: `The incubation period has been reset to Day 1.` });
  }, [isLocked, toast, setValue, data.incubation.isIncubating]);

  const toggleIncubation = useCallback(() => {
    if (isLocked) {
      toast({ variant: "destructive", title: "System Locked", description: "Unlock to manage the incubation cycle." });
      return;
    }
    const newStatus = !data.incubation.isIncubating;
    if (newStatus) {
      // Starting incubation
      updateValues({ 'incubation/isIncubating': true, 'incubation/currentDay': 1 });
      toast({ title: "Incubation Started", description: `The cycle for ${data.incubation.eggType} eggs has begun.` });
    } else {
      // Stopping incubation
      setValue('incubation/isIncubating', false);
      toast({ title: "Incubation Stopped", description: "The incubation cycle has been paused." });
    }
  }, [isLocked, toast, data.incubation.isIncubating, data.incubation.eggType, updateValues, setValue]);

  const setNumberOfEggs = useCallback((count: number) => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to change the number of eggs." }); return; }
    if (count < 1 || count > 112) { toast({ variant: "destructive", title: "Invalid Egg Count", description: "Number of eggs must be between 1 and 112." }); return; }
    setValue('incubation/numberOfEggs', count);
  }, [isLocked, toast, setValue]);

  const unlock = useCallback((pin: string) => {
    return new Promise<boolean>((resolve) => {
      if (!data.control.accessCode) {
        toast({
          variant: "destructive",
          title: "PIN Not Set",
          description: "Please set a PIN before unlocking.",
        });
        resolve(false);
        return;
      }
      if (pin === data.control.accessCode) {
        setIsLocked(false);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }, [data.control.accessCode, toast]);

  const lock = useCallback(() => {
    setIsLocked(true);
    toast({
      title: "System Locked",
      description: "Controls are now secured.",
    });
  }, [toast]);
  
  const setAccessCode = useCallback((pin: string) => {
    const fullPath = getDbPath('control/accessCode');
    if (!database || !fullPath) return;
    const dbRef = ref(database, fullPath);
    set(dbRef, pin);
  }, [getDbPath]);

  const value = { data, isLocked, toggleFan, toggleHeater, toggleMotor, toggleCamera, setEggType, unlock, lock, setAccessCode, setTargetTemperature, setTargetHumidity, setSensorTemperature, setSensorHumidity, setCurrentDay, setTotalDays, resetIncubation, toggleIncubation, setNumberOfEggs };

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
