
// API token for WAQI
const WAQI_TOKEN = 'b88abf98bd46a6bfdf78557ded1699691e2ace94';
const BASE_URL = 'https://api.waqi.info';

export interface AQIData {
  aqi: number;
  idx: number;
  attributions: Array<{
    url: string;
    name: string;
  }>;
  city: {
    geo: [number, number];
    name: string;
    url: string;
  };
  dominentpol: string;
  iaqi: {
    [key: string]: {
      v: number;
    };
  };
  time: {
    s: string;
    tz: string;
    v: number;
  };
  forecast?: {
    daily: {
      o3: Array<{day: string, avg: number, min: number, max: number}>;
      pm10: Array<{day: string, avg: number, min: number, max: number}>;
      pm25: Array<{day: string, avg: number, min: number, max: number}>;
    };
  };
}

export interface AQIResponse {
  status: string;
  data: AQIData;
}

export interface WaterQualityData {
  index: number;
  status: string;
  parameters: {
    [key: string]: number;
  };
  timestamp: string;
}

// Get current AQI data based on geolocation
export const getCurrentAQI = async (
  latitude?: number,
  longitude?: number
): Promise<AQIData> => {
  try {
    let url;
    
    if (latitude && longitude) {
      url = `${BASE_URL}/feed/geo:${latitude};${longitude}/?token=${WAQI_TOKEN}`;
    } else {
      url = `${BASE_URL}/feed/here/?token=${WAQI_TOKEN}`;
    }

    const response = await fetch(url);
    const data: AQIResponse = await response.json();

    if (data.status !== 'ok') {
      throw new Error('Failed to fetch AQI data');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    throw error;
  }
};

// Get AQI forecast for next few days
export const getAQIForecast = async (stationId: number): Promise<AQIData> => {
  try {
    const url = `${BASE_URL}/feed/@${stationId}/?token=${WAQI_TOKEN}`;
    const response = await fetch(url);
    const data: AQIResponse = await response.json();

    if (data.status !== 'ok') {
      throw new Error('Failed to fetch AQI forecast');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching AQI forecast:', error);
    throw error;
  }
};

// Get nearby stations
export const getNearbyStations = async (
  latitude: number,
  longitude: number,
  range = 50 // km
): Promise<AQIData[]> => {
  try {
    const url = `${BASE_URL}/map/bounds/?latlng=${latitude - range/111},${longitude - range/111},${latitude + range/111},${longitude + range/111}&token=${WAQI_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error('Failed to fetch nearby stations');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    throw error;
  }
};

// Mock function for water quality (as this would require a separate API)
export const getWaterQuality = async (): Promise<WaterQualityData> => {
  // This is a mock implementation as we don't have a real water quality API
  return {
    index: Math.floor(Math.random() * 100),
    status: 'good',
    parameters: {
      ph: 7.2,
      turbidity: 1.8,
      dissolvedOxygen: 8.5,
      conductivity: 450,
    },
    timestamp: new Date().toISOString()
  };
};

// User location
export const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    }
  });
};
