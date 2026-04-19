
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
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

export interface IncubationHistoryEntry {
  id: number;
  startDate: string;
  endDate: string | null;
  eggType: string;
  totalDays: number;
  outcome: 'In Progress' | 'Cancelled' | 'Hatched' | 'Failed';
  hatchedCount: number;
  totalEggs: number;
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
    mist: boolean;
    targetTemperature: number;
    targetHumidity: number;
    accessCode: string;
    autonomousClimate: boolean;
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
    incubationHistory?: IncubationHistoryEntry[];
    activeCycleId?: number | null;
  };
}

interface IncubatorContextType {
  data: IncubatorData;
  isLocked: boolean;
  toggleFan: () => void;
  toggleHeater: () => void;
  toggleMotor: () => void;
  toggleMist: () => void;
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
  deleteHistoryEntry: (historyId: number) => void;
  deleteCameraLogEntry: (logId: number) => void;
  setAutonomousClimate: (status: boolean) => void;
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
    mist: false,
    targetTemperature: 35.0,
    targetHumidity: 50,
    accessCode: "",
    autonomousClimate: true,
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
    incubationHistory: [],
    activeCycleId: null,
  },
};

const IncubatorContext = createContext<IncubatorContextType | undefined>(undefined);

export const IncubatorProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [data, setData] = useState<IncubatorData>(initialData);
  const [isLocked, setIsLocked] = useState(true);
  const { toast } = useToast();
  const previousLiveFeedUrl = useRef<string | undefined>();

  const getDbPath = useCallback((path: string) => {
    if (!user) return null;
    return `incubators/${user.uid}/${path}`;
  }, [user]);

  useEffect(() => {
    // On initial mount for a user, ensure the buzzer is reset to OFF.
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
        // Initialize the ref with the first data load
        if (previousLiveFeedUrl.current === undefined) {
          previousLiveFeedUrl.current = mergedData.incubation.liveFeedUrl;
        }
      } else {
        setData(initialData);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Effect to automatically archive the old live feed URL when a new one arrives.
  useEffect(() => {
    const newLiveFeedUrl = data.incubation.liveFeedUrl;
    const oldLiveFeedUrl = previousLiveFeedUrl.current;

    if (newLiveFeedUrl && newLiveFeedUrl !== oldLiveFeedUrl && oldLiveFeedUrl) {
      const fullPath = getDbPath('incubation/cameraLog');
      if (!database || !fullPath) return;

      const currentLog = data.incubation.cameraLog || [];
      const logAsArray = Array.isArray(currentLog) ? currentLog : Object.values(currentLog);

      const newLogEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        image: oldLiveFeedUrl, // Archive the OLD url
        event: 'New Snapshot'
      };

      const newCameraLog = [newLogEntry, ...logAsArray];
      const dbRef = ref(database, fullPath);
      set(dbRef, newCameraLog);
    }

    // After processing, update the ref to the current URL for the next change detection.
    previousLiveFeedUrl.current = newLiveFeedUrl;
  }, [data.incubation.liveFeedUrl, getDbPath, user, database, data.incubation.cameraLog]);

  useEffect(() => {
    if (!database || !user || !data.sensors || !data.control) return;

    const updates: { [key: string]: any } = {};
    const { temperature, humidity } = data.sensors;
    const { targetTemperature, targetHumidity, autonomousClimate } = data.control;
    const currentAlert = data.alertSystem;

    // --- Alert Logic ---
    const TEMP_ALERT_DEVIATION = 5.0;
    const HUMIDITY_ALERT_DEVIATION = 20;
    const newAlert: AlertSystem = { status: 'SYSTEM_OK', temperatureState: 'NORMAL', humidityState: 'NORMAL', buzzer: false, message: 'System stable. Optimal conditions.'};
    let messages: string[] = [];
    let isCritical = false;

    const tempDiff = temperature - targetTemperature;
    if (Math.abs(tempDiff) > TEMP_ALERT_DEVIATION) {
      isCritical = true;
      newAlert.temperatureState = tempDiff > 0 ? 'HIGH' : 'LOW';
      messages.push(`Temp is ${newAlert.temperatureState.toLowerCase()}`);
    }

    const humidityDiff = humidity - targetHumidity;
    if (Math.abs(humidityDiff) > HUMIDITY_ALERT_DEVIATION) {
      isCritical = true;
      newAlert.humidityState = humidityDiff > 0 ? 'HIGH' : 'LOW';
      messages.push(`Humidity is ${newAlert.humidityState.toLowerCase()}`);
    }

    if (isCritical) {
      newAlert.status = 'CRITICAL';
      newAlert.buzzer = true;
      newAlert.message = `CRITICAL: ${messages.join(' & ')}.`;
    }

    if (JSON.stringify(newAlert) !== JSON.stringify(currentAlert)) {
      updates['alertSystem'] = newAlert;
      if (newAlert.status === 'CRITICAL' && currentAlert.status !== 'CRITICAL') {
        toast({ variant: 'destructive', title: 'Critical Alert', description: newAlert.message, duration: 12000 });
      }
    }

    // --- Autonomous Climate Control ---
    if (autonomousClimate) {
        const { heater, fan, mist } = data.control;
        let newHeaterState = heater;
        let newFanState = fan;
        let newMistState = mist;

        // NEW LOGIC: Heater is always on, fan regulates.
        newHeaterState = true; 

        if (temperature > targetTemperature) {
            newFanState = true; // Turn on fan to cool down.
        } else {
            newFanState = false; // Turn off fan when at or below target.
        }

        // Humidity Control (remains the same)
        if (humidity < targetHumidity - 5) {
            newMistState = true;    // Turn on mist if 5% below target
        } else if (humidity >= targetHumidity) {
            newMistState = false;   // Turn off mist when target is reached
        }

        if (newHeaterState !== heater) updates['control/heater'] = newHeaterState;
        if (newFanState !== fan) updates['control/fan'] = newFanState;
        if (newMistState !== mist) updates['control/mist'] = newMistState;
    }

    if (Object.keys(updates).length > 0) {
      const incubatorRef = ref(database, `incubators/${user.uid}`);
      update(incubatorRef, updates);
    }
  }, [ user, toast, data.sensors, data.control, data.alertSystem ]);


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

  const manualOverride = (updates: object) => {
      if (isLocked) { toast({ variant: "destructive", title: "System Locked" }); return; }
      updateValues({
          'control/autonomousClimate': false,
          ...updates,
      });
  }

  const toggleHeater = useCallback(() => manualOverride({'control/heater': !data.control.heater}), [data.control.heater, manualOverride]);
  const toggleFan = useCallback(() => manualOverride({'control/fan': !data.control.fan}), [data.control.fan, manualOverride]);
  const toggleMist = useCallback(() => manualOverride({'control/mist': !data.control.mist}), [data.control.mist, manualOverride]);

  const toggleMotor = useCallback(() => setValue('control/motor', !data.control.motor), [setValue, data.control.motor]);
  
  const toggleCamera = useCallback((checked: boolean) => {
    // This function only signals the device to turn on or off.
    // It does not directly manipulate URLs or logs.
    if (isLocked) {
      toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to toggle the camera." });
      return;
    }
    setValue('control/cameraOn', checked);
  }, [isLocked, toast, setValue]);

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
    const updates: { [key: string]: any } = {};
    const history = Array.isArray(data.incubation.incubationHistory) ? [...data.incubation.incubationHistory] : Object.values(data.incubation.incubationHistory || []);

    if (newStatus) { // Starting incubation
      const newEntry: IncubationHistoryEntry = {
        id: Date.now(), startDate: new Date().toISOString(), endDate: null, eggType: data.incubation.eggType, totalDays: data.incubation.totalDays,
        outcome: 'In Progress', hatchedCount: 0, totalEggs: data.incubation.numberOfEggs,
      };
      updates['incubation/isIncubating'] = true;
      updates['incubation/currentDay'] = 1;
      updates['incubation/activeCycleId'] = newEntry.id;
      updates['incubation/incubationHistory'] = [newEntry, ...history];
      updateValues(updates);
      toast({ title: "Incubation Started", description: `The cycle for ${data.incubation.eggType} eggs has begun and logged.` });

    } else { // Stopping/Cancelling incubation
      const activeId = data.incubation.activeCycleId;
      const activeCycleIndex = history.findIndex(h => h.id === activeId);
      if (activeCycleIndex > -1) {
        history[activeCycleIndex] = { ...history[activeCycleIndex], outcome: 'Cancelled', endDate: new Date().toISOString() };
        updates['incubation/incubationHistory'] = history;
      }
      updates['incubation/isIncubating'] = false;
      updates['incubation/activeCycleId'] = null;
      updateValues(updates);
      toast({ title: "Incubation Stopped", description: "The incubation cycle has been cancelled and logged." });
    }
  }, [isLocked, toast, data.incubation, updateValues]);

  const setNumberOfEggs = useCallback((count: number) => {
    if (isLocked) { toast({ variant: "destructive", title: "System Locked", description: "Unlock the system to change the number of eggs." }); return; }
    if (count < 1 || count > 112) { toast({ variant: "destructive", title: "Invalid Egg Count", description: "Number of eggs must be between 1 and 112." }); return; }
    setValue('incubation/numberOfEggs', count);
  }, [isLocked, toast, setValue]);

  const unlock = useCallback((pin: string) => {
    return new Promise<boolean>((resolve) => {
      if (!data.control.accessCode) {
        toast({ variant: "destructive", title: "PIN Not Set", description: "Please set a PIN before unlocking." });
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
    toast({ title: "System Locked", description: "Controls are now secured." });
  }, [toast]);
  
  const setAccessCode = useCallback((pin: string) => {
    const fullPath = getDbPath('control/accessCode');
    if (!database || !fullPath) return;
    const dbRef = ref(database, fullPath);
    set(dbRef, pin);
  }, [getDbPath]);

  const deleteHistoryEntry = useCallback((historyId: number) => {
    const fullPath = getDbPath('incubation/incubationHistory');
    if (!database || !fullPath) return;
    const currentHistory = data.incubation.incubationHistory || [];
    const historyAsArray = Array.isArray(currentHistory) ? currentHistory : Object.values(currentHistory);
    const newHistory = historyAsArray.filter(entry => entry.id !== historyId);
    if (data.incubation.activeCycleId === historyId) {
        const updates: { [key: string]: any } = {};
        updates['incubation/incubationHistory'] = newHistory;
        updates['incubation/isIncubating'] = false;
        updates['incubation/activeCycleId'] = null;
        updateValues(updates);
        toast({ variant: 'destructive', title: "Active Cycle Deleted", description: "The active incubation cycle has been deleted." });
    } else {
        const dbRef = ref(database, fullPath);
        set(dbRef, newHistory);
        toast({ title: "History Entry Deleted", description: "The incubation record has been removed." });
    }
  }, [getDbPath, data.incubation, toast, updateValues]);

  const deleteCameraLogEntry = useCallback((logId: number) => {
    const fullPath = getDbPath('incubation/cameraLog');
    if (!database || !fullPath) return;

    const currentLog = data.incubation.cameraLog || [];
    const logAsArray = Array.isArray(currentLog) ? currentLog : Object.values(currentLog);
    const newLog = logAsArray.filter(entry => entry.id !== logId);

    const dbRef = ref(database, fullPath);
    set(dbRef, newLog);
    toast({ title: "Log Entry Deleted", description: "The camera log entry has been removed." });
}, [getDbPath, data.incubation.cameraLog, toast]);

  const setAutonomousClimate = useCallback((status: boolean) => {
    if (isLocked) {
        toast({ variant: "destructive", title: "System Locked", description: "Unlock to change climate mode." });
        return;
    }
    const fullPath = getDbPath('control/autonomousClimate');
    if (!database || !fullPath) return;
    const dbRef = ref(database, fullPath);
    set(dbRef, status);
  }, [isLocked, toast, getDbPath]);

  const value = { data, isLocked, toggleFan, toggleHeater, toggleMotor, toggleMist, toggleCamera, setEggType, unlock, lock, setAccessCode, setTargetTemperature, setTargetHumidity, setSensorTemperature, setSensorHumidity, setCurrentDay, setTotalDays, resetIncubation, toggleIncubation, setNumberOfEggs, deleteHistoryEntry, deleteCameraLogEntry, setAutonomousClimate };

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

    
