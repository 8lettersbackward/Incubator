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
  };
  alertSystem: AlertSystem;
  eggType: string;
  incubationDay: number;
  totalIncubationDays: number;
  numberOfEggs: number;
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
  setIncubationDay: (day: number) => void;
  setTotalIncubationDays: (days: number) => void;
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
  control: {
    heater: false,
    fan: false,
    motor: false,
    humidityControl: false,
    targetTemperature: 37.5,
    targetHumidity: 55,
    cameraOn: true,
    wifiConnected: true,
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
  eggType: 'Chicken',
  incubationDay: 1,
  totalIncubationDays: EGG_INCUBATION_PERIODS['Chicken'],
  numberOfEggs: 56,
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
    if (!database) return;
    const newTotalDays = EGG_INCUBATION_PERIODS[eggType] || 21;
    const incubatorRef = ref(database, 'incubator');
    update(incubatorRef, {
      eggType: eggType,
      incubationDay: 1,
      totalIncubationDays: newTotalDays
    });
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
    if (day >= 1 && day <= data.totalIncubationDays) {
      if (!database) return;
      const dayRef = ref(database, 'incubator/incubationDay');
      set(dayRef, day);
    }
  }, [isLocked, toast, data.totalIncubationDays]);

  const setTotalIncubationDays = (days: number) => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "System Locked",
        description: "Unlock the system to change incubation duration.",
      });
      return;
    }
    if (!database) return;
    const incubatorRef = ref(database, 'incubator');
    update(incubatorRef, {
      totalIncubationDays: days,
      incubationDay: 1
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
    const dayRef = ref(database, 'incubator/incubationDay');
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
    const eggsRef = ref(database, 'incubator/numberOfEggs');
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

  const value = { data, isLocked, toggleFan, toggleHeater, toggleMotor, toggleCamera, toggleWifi, refillWater, setEggType, unlock, lock, setAccessCode, setTargetTemperature, setTargetHumidity, setSensorTemperature, setSensorHumidity, setIncubationDay, setTotalIncubationDays, resetIncubation, setNumberOfEggs };

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
