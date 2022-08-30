interface Common {
    model?: string;
    mac?: string;
    uid?: string;
    device: string;
    timestamp: string;
    temperature: number;
    humidity: number;
    pressure: number;
  }

export interface Grow extends Common {
    light: number;
    moisture_1: number;
    moisture_2: number;
    moisture_3: number;
    pump_1_on?: boolean;
    pump_2_on?: boolean;
    pump_3_on?: boolean;
}

export interface Indoor extends Common {
  luminance: number;
  color_temperature: number;
}

export interface Weather extends Common {
   light: number;
   wind_speed: number;
   rain: number;
   wind_direction: number;
}

export interface Urban extends Common {
  noise: number;
  pm1: number;
  pm2_5: number;
  pm10: number;
}

export type Reading = Urban | Weather | Indoor | Grow | Common;

export interface Board {
    name: string;
    mac?: string;
    newReading: (r: Reading) => void;
}