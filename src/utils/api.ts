import axios from 'axios';

// API token for WAQI
const WAQI_TOKEN = 'b88abf98bd46a6bfdf78557ded1699691e2ace94';
// Meersens API key - in a real application, this should be stored securely
const MEERSENS_API_KEY = 'Y3lV8N2UnqoMjSonpTpljle9jHaIXhWp';
const BASE_URL = 'https://api.waqi.info';
const LOCAL_API_URL = 'https://flask-backend-dzye.onrender.com/api';
// const MEERSENS_URL = 'https://api.meersens.com/environment';

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

export interface MeersensAQIData {
  aqi: number;
  dominentpol: string;
  iaqi: {
    [key: string]: number;
  };
  additional_factors: {
    traffic_impact: number;
    industrial_proximity: number;
    weather_influence: number;
  };
}

export interface MeersensResponse {
  status: string;
  data: MeersensAQIData;
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
//working

// Get AQI forecast for next few days
// export const getAQIForecast = async (stationId: number): Promise<AQIData> => {
//   try {
//     const url = `${BASE_URL}/feed/@${stationId}/?token=${WAQI_TOKEN}`;
//     const response = await fetch(url);
//     const data: AQIResponse = await response.json();

//     if (data.status !== 'ok') {
//       throw new Error('Failed to fetch AQI forecast');
//     }
//     console.log(data.data);
//     return data.data;
//   } catch (error) {
//     console.error('Error fetching AQI forecast:', error);
//     throw error;
//   }
// };

// Get nearby stations
// export const getNearbyStations = async (
//   latitude: number,
//   longitude: number,
//   range = 50 // km
// ): Promise<AQIData[]> => {
//   try {
//     const url = `${BASE_URL}/map/bounds/?latlng=${latitude - range/111},${longitude - range/111},${latitude + range/111},${longitude + range/111}&token=${WAQI_TOKEN}`;
//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.status !== 'ok') {
//       throw new Error('Failed to fetch nearby stations');
//     }

//     return data.data;
//   } catch (error) {
//     console.error('Error fetching nearby stations:', error);
//     throw error;
//   }
// };

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
    const data = await response.json();

    // Fix timestamp format by removing microseconds
    const formattedData = data.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp.split(".")[0]) // Removes microseconds before parsing
    }));

    // console.log("######################", formattedData);
    return formattedData;
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

// Get enhanced AQI data from Meersens API
export const getMeersensAQIData = async (
  latitude: number,
  longitude: number
): Promise<MeersensAQIData | null> => {
  try {
    // First, attempt to use our local enhanced prediction as a fallback
    const baseAQIResponse = await getCurrentAQI(latitude, longitude);
    const baseAQI = baseAQIResponse.aqi;
    const enhancedPrediction = await getEnhancedAQIPrediction(baseAQI, {lat: latitude, lng: longitude});
    
    // Simulate Meersens API response with our enhanced data
    // In a real app, you would use the actual Meersens API endpoint
    // const url = `${MEERSENS_URL}/air-quality?lat=${latitude}&lng=${longitude}&key=${MEERSENS_API_KEY}`;
    // const response = await fetch(url);
    // const meersensData = await response.json();
    
    // Simulated response using our enhanced prediction
    const meersensData: MeersensAQIData = {
      aqi: enhancedPrediction.enhanced_aqi,
      dominentpol: baseAQIResponse.dominentpol || 'pm25',
      iaqi: {
        pm25: baseAQIResponse.iaqi?.pm25?.v || 0,
        pm10: baseAQIResponse.iaqi?.pm10?.v || 0,
        o3: baseAQIResponse.iaqi?.o3?.v || 0,
        no2: baseAQIResponse.iaqi?.no2?.v || 0,
        so2: baseAQIResponse.iaqi?.so2?.v || 0,
        co: baseAQIResponse.iaqi?.co?.v || 0
      },
      additional_factors: {
        traffic_impact: enhancedPrediction.factors.traffic,
        industrial_proximity: 1.0, // Simulated value
        weather_influence: enhancedPrediction.factors.weather
      }
    };
    
    return meersensData;
  } catch (error) {
    console.error('Error fetching Meersens AQI data:', error);
    return null;
  }
};

// User location
export const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position); // Logs the GeolocationPosition object
          resolve(position);
        },
        (error) => {
          console.error(error); // Logs the error
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  });
};
//working

export const getCurrentuvquality = async () =>{
  const link = 'https://api.meersens.com/environment/public/uv/current';
  try {
    const location = await getUserLocation()
    // console.log();
    const data = await axios.get(link,{
      params: { 
        lat:location.coords.latitude-1,
        lng: location.coords.longitude-2,
        health_recommendations: true
      },
      headers: {'apikey': MEERSENS_API_KEY }
    })
    if(data.status === 200 ){
      // console.log(data);
      return data
    }
  } catch (error) {
    console.log(error)
  }
}


export const getCurrentnoisequality = async () =>{
  const link = 'https://api.meersens.com/environment/public/air/current';
  try {
    const location = await getUserLocation()
    // console.log();
    const data = await axios.get(link,{
      params: { 
        lat:location.coords.latitude,
        lng: location.coords.longitude,
        health_recommendations: true
      },
      headers: {'apikey': MEERSENS_API_KEY }
    })
    if(data.status === 200 ){
      // console.log(data);
      return data
    }
  } catch (error) {
    console.log(error)
  }
}

getCurrentnoisequality()