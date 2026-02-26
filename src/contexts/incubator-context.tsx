"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { database } from '@/firebase/config';
import { ref, onValue, set, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

// Data types
export interface AlertSystem {
  status: 'SYSTEM_OK' | 'WARNING' | 'CRITICAL';
  temperatureState: 'NORMAL' | 'HIGH' | 'LOW';
  humidityState: 'NORMAL' | 'HIGH' | 'LOW';
  buzzer: boolean;
  message: string;
}

export interface IncubatorData {
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
  toggleWifi: () => void;
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
  setNumberOfEggs: (count: number) => void;
}

const EGG_INCUBATION_PERIODS: { [key: string]: number } = {
  Chicken: 21,
  Duck: 28,
  Quail: 18,
  Turkey: 28,
};

// Initial State
const initialData: IncubatorData = {
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
  const [data, setData] = useState<IncubatorData>(initialData);
  const [isLocked, setIsLocked] = useState(true);
  const [accessCode, setAccessCode] = useState('1234'); // Default PIN
  const { toast } = useToast();
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

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
        setData(snapshot.val());
      } else {
        set(incubatorRef, initialData);
      }
    });
    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (!database || !data.sensors || !data.alertSystem) return;

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
      newAlert.status = 'CRITICAL';
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
      const alertSystemRef = ref(database, 'incubator/alertSystem');
      set(alertSystemRef, newAlert);
    }
  }, [data.sensors, data.alertSystem, database]);

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
  
  const setStatusValue = useCallback((key: string, value: any) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to make changes.",
      });
      return false;
    }
    if (!database) return false;
    const statusRef = ref(database, `incubator/status/${key}`);
    set(statusRef, value);
    return true;
  }, [isLocked, toast]);

  const setSensorValue = useCallback((key: string, value: any) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to make changes.",
      });
      return false;
    }
    if (!database) return false;
    const sensorRef = ref(database, `incubator/sensors/${key}`);
    set(sensorRef, value);
    return true;
  }, [isLocked, toast]);

  const setSensorTemperature = useCallback((temp: number) => {
    setSensorValue('temperature', temp);
  }, [setSensorValue]);

  const setSensorHumidity = useCallback((humidity: number) => {
    setSensorValue('humidity', humidity);
  }, [setSensorValue]);

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
    setStatusValue('wifiConnected', !data.status.wifiConnected);
  }, [setStatusValue, data.status.wifiConnected]);
  
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
    if (!database) return;
    const newTotalDays = EGG_INCUBATION_PERIODS[eggType] || 21;
    const incubationRef = ref(database, 'incubator/incubation');
    update(incubationRef, {
      eggType: eggType,
      currentDay: 1,
      totalDays: newTotalDays
    });
  }, [isLocked, toast]);

  const setCurrentDay = useCallback((day: number) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to adjust incubation day.",
      });
      return;
    }
    if (day >= 1 && day <= data.incubation.totalDays) {
      if (!database) return;
      const dayRef = ref(database, 'incubator/incubation/currentDay');
      set(dayRef, day);
    }
  }, [isLocked, toast, data.incubation.totalDays]);

  const setTotalDays = (days: number) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to change incubation duration.",
      });
      return;
    }
    if (!database) return;
    const incubationRef = ref(database, 'incubator/incubation');
    update(incubationRef, {
      totalDays: days,
      currentDay: 1
    });
  };

  const resetIncubation = useCallback(() => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to reset incubation.",
      });
      return;
    }
    if (!database) return;
    const dayRef = ref(database, 'incubator/incubation/currentDay');
    set(dayRef, 1);
    toast({
      title: "Incubation Reset",
      description: `The incubation period has been reset to Day 1.`,
    });
  }, [isLocked, toast]);

  const setNumberOfEggs = useCallback((count: number) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to change the number of eggs.",
      });
      return;
    }
    if (!database) return;
    if (count < 1 || count > 112) {
      toast({
        variant: "destructive",
        title: "Invalid Egg Count",
        description: "Number of eggs must be between 1 and 112.",
      });
      return;
    }
    const eggsRef = ref(database, 'incubator/incubation/numberOfEggs');
    set(eggsRef, count);
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

  const value = { data, isLocked, toggleFan, toggleHeater, toggleMotor, toggleCamera, toggleWifi, refillWater, setEggType, unlock, lock, setAccessCode, setTargetTemperature, setTargetHumidity, setSensorTemperature, setSensorHumidity, setCurrentDay, setTotalDays, resetIncubation, setNumberOfEggs };

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
