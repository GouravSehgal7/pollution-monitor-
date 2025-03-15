
import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { 
  getCurrentAQI, 
  getWaterQuality, 
  getUserLocation,
  AQIData,
  WaterQualityData
} from "../utils/api";
import { 
  generateHourlyAQIForecast, 
  generateDailyAQIForecast,
  UserProfile, 
  getPersonalizedRecommendations 
} from "../utils/ml-prediction";
import { getAQICategory, evaluateWaterQuality } from "../utils/aqi-calculator";

interface AQIContextType {
  currentAQI: AQIData | null;
  waterQuality: WaterQualityData | null;
  loading: boolean;
  error: string | null;
  location: { lat: number; lng: number } | null;
  hourlyForecast: { hour: number; aqi: number }[];
  dailyForecast: { day: string; aqi: number }[];
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  personalizedRecommendations: {
    recommendedHours: number[];
    personalAdvice: string[];
  } | null;
  refreshData: () => Promise<void>;
}

const defaultUserProfile: UserProfile = {
  hasSensitivities: false,
  activityLevel: 'moderate',
  typicalOutdoorHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
};

const AQIContext = createContext<AQIContextType | undefined>(undefined);

export const AQIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAQI, setCurrentAQI] = useState<AQIData | null>(null);
  const [waterQuality, setWaterQuality] = useState<WaterQualityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<{ hour: number; aqi: number }[]>([]);
  const [dailyForecast, setDailyForecast] = useState<{ day: string; aqi: number }[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user-profile');
    return saved ? JSON.parse(saved) : defaultUserProfile;
  });
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<{
    recommendedHours: number[];
    personalAdvice: string[];
  } | null>(null);

  // Check for threshold crossing
  const checkThresholds = (newAQI: number, previousAQI: number | null) => {
    // AQI threshold alerts
    const thresholds = [50, 100, 150, 200, 300];
    
    // Only alert if we have a previous reading and we've crossed a threshold
    if (previousAQI) {
      for (const threshold of thresholds) {
        if ((previousAQI < threshold && newAQI >= threshold) || 
            (previousAQI >= threshold && newAQI < threshold)) {
          const category = getAQICategory(newAQI);
          const message = newAQI >= threshold
            ? `Air quality has worsened to ${category}`
            : `Air quality has improved to ${category}`;
            
          toast(message, {
            description: `Current AQI: ${newAQI}`,
            duration: 5000,
          });
          break;
        }
      }
    }
  };

  // Check water quality alerts
  const checkWaterQualityAlert = (quality: WaterQualityData) => {
    const evaluation = evaluateWaterQuality(quality.index);
    
    if (!evaluation.safe) {
      toast.error("Water Quality Alert", {
        description: `Water quality is ${evaluation.status}: ${evaluation.description}`,
        duration: 5000,
      });
    }
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user location
      let userLat, userLng;
      try {
        const position = await getUserLocation();
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
        setLocation({ lat: userLat, lng: userLng });
      } catch (e) {
        console.error("Could not get user location:", e);
        // Continue without location
      }

      // Get AQI data
      const aqiData = await getCurrentAQI(userLat, userLng);
      
      // Check for AQI threshold crossing if we have previous data
      if (currentAQI) {
        checkThresholds(aqiData.aqi, currentAQI.aqi);
      }
      
      setCurrentAQI(aqiData);
      
      // Generate forecasts
      const hourly = generateHourlyAQIForecast(aqiData.aqi);
      const daily = generateDailyAQIForecast(aqiData.aqi);
      
      setHourlyForecast(hourly);
      setDailyForecast(daily);
      
      // Get water quality data (mock)
      const waterData = await getWaterQuality();
      setWaterQuality(waterData);
      
      // Check water quality alerts
      checkWaterQualityAlert(waterData);
      
      // Generate personalized recommendations
      const recommendations = getPersonalizedRecommendations(
        aqiData.aqi,
        hourly,
        userProfile
      );
      
      setPersonalizedRecommendations(recommendations);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      
      // Show error toast
      toast.error("Error fetching data", {
        description: err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...profile };
      localStorage.setItem('user-profile', JSON.stringify(updated));
      return updated;
    });
  };

  // Refresh data manually
  const refreshData = async () => {
    await fetchData();
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
    
    // Set up polling interval (every 10 minutes)
    const intervalId = setInterval(() => {
      fetchData();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Update recommendations when user profile changes
  useEffect(() => {
    if (currentAQI && hourlyForecast.length > 0) {
      const recommendations = getPersonalizedRecommendations(
        currentAQI.aqi,
        hourlyForecast,
        userProfile
      );
      
      setPersonalizedRecommendations(recommendations);
    }
  }, [userProfile, currentAQI, hourlyForecast]);

  const value = {
    currentAQI,
    waterQuality,
    loading,
    error,
    location,
    hourlyForecast,
    dailyForecast,
    userProfile,
    updateUserProfile,
    personalizedRecommendations,
    refreshData
  };

  return <AQIContext.Provider value={value}>{children}</AQIContext.Provider>;
};

export const useAQI = (): AQIContextType => {
  const context = useContext(AQIContext);
  if (context === undefined) {
    throw new Error("useAQI must be used within an AQIProvider");
  }
  return context;
};
