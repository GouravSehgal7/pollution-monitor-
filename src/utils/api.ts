
// API token for WAQI
const WAQI_TOKEN = 'b88abf98bd46a6bfdf78557ded1699691e2ace94';
const BASE_URL = 'https://api.waqi.info';
const LOCAL_API_URL = 'http://localhost:5000/api';

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
  safe: boolean;
  last_updated?: string;
}

export interface TrafficData {
  vehicles_per_hour: number;
  congestion_level: string;
  last_updated: string;
  pollution_factor: number;
}

export interface EnhancedAQIPrediction {
  original_aqi: number;
  enhanced_aqi: number;
  factors: {
    traffic: number;
    weather: number;
    time_of_day: number;
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

// Get water quality data from our Flask API
export const getWaterQuality = async (): Promise<WaterQualityData> => {
  try {
    const response = await fetch(`${LOCAL_API_URL}/water/current`);
    if (!response.ok) {
      throw new Error('Failed to fetch water quality data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching water quality data:', error);
    // Fallback to mock data if API is not available
    return {
      index: Math.floor(Math.random() * 100),
      status: 'good',
      parameters: {
        ph: 7.2,
        turbidity: 1.8,
        dissolvedOxygen: 8.5,
        conductivity: 450,
      },
      timestamp: new Date().toISOString(),
      safe: true
    };
  }
};

// Get water quality history
export const getWaterQualityHistory = async (): Promise<WaterQualityData[]> => {
  try {
    const response = await fetch(`${LOCAL_API_URL}/water/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch water quality history');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching water quality history:', error);
    return [];
  }
};

// Get traffic data
export const getTrafficData = async (): Promise<TrafficData> => {
  try {
    const response = await fetch(`${LOCAL_API_URL}/traffic/current`);
    if (!response.ok) {
      throw new Error('Failed to fetch traffic data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching traffic data:', error);
    // Fallback to mock data if API is not available
    return {
      vehicles_per_hour: 350,
      congestion_level: "moderate",
      last_updated: new Date().toISOString(),
      pollution_factor: 1.2
    };
  }
};

// Get traffic history
export const getTrafficHistory = async (): Promise<TrafficData[]> => {
  try {
    const response = await fetch(`${LOCAL_API_URL}/traffic/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch traffic history');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching traffic history:', error);
    return [];
  }
};

// Enhance AQI prediction with traffic data
export const getEnhancedAQIPrediction = async (baseAQI: number, location: {lat: number, lng: number}): Promise<EnhancedAQIPrediction> => {
  try {
    const response = await fetch(`${LOCAL_API_URL}/aqi/enhance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_aqi: baseAQI,
        location: location
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to enhance AQI prediction');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error enhancing AQI prediction:', error);
    // Fallback to mock enhanced data
    return {
      original_aqi: baseAQI,
      enhanced_aqi: Math.round(baseAQI * 1.1),
      factors: {
        traffic: 1.1,
        weather: 1.0,
        time_of_day: 1.0
      },
      timestamp: new Date().toISOString()
    };
  }
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
