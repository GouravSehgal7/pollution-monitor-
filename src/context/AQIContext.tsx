import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { 
  getCurrentAQI, 
  getWaterQuality, 
  getUserLocation,
  getMeersensAQIData,
  AQIData,
  WaterQualityData,
  MeersensAQIData
} from "../utils/api";
import { 
  generateHourlyAQIForecast, 
  generateDailyAQIForecast,
  UserProfile, 
  getPersonalizedRecommendations 
} from "../utils/ml-prediction";
import { 
  getAQICategory, 
  evaluateWaterQuality, 
  getHealthBasedRecommendations,
  HealthCondition 
} from "../utils/aqi-calculator";

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
    healthRecommendations: string[];
  } | null;
  refreshData: () => Promise<void>;
  meersensData: MeersensAQIData | null;
  playAlertSound: (type: 'water' | 'air') => void;
}

const defaultUserProfile: UserProfile = {
  hasSensitivities: false,
  activityLevel: 'moderate',
  typicalOutdoorHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  healthCondition: 'none'
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
    healthRecommendations: string[];
  } | null>(null);
  const [meersensData, setMeersensData] = useState<MeersensAQIData | null>(null);

  const playAlertSound = (type: 'water' | 'air') => {
    const audio = new Audio(type === 'water' ? '/alarm-sound.mp3' : '/alert-sound.mp3');
    audio.play().catch(err => console.error('Error playing sound:', err));
  };

  const checkThresholds = (newAQI: number, previousAQI: number | null) => {
    const thresholds = [50, 100, 150, 200, 300];
    
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

  const checkWaterQualityAlert = (quality: WaterQualityData) => {
    const evaluation = evaluateWaterQuality(quality.index);
    
    if (!evaluation.safe) {
      toast.error("Water Quality Alert", {
        description: `Water quality is ${evaluation.status}: ${evaluation.description}`,
        duration: 5000,
      });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
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

      const aqiData = await getCurrentAQI(userLat, userLng);
      
      if (currentAQI) {
        checkThresholds(aqiData.aqi, currentAQI.aqi);
      }
      
      setCurrentAQI(aqiData);
      
      if (userLat && userLng) {
        const enhancedData = await getMeersensAQIData(userLat, userLng);
        if (enhancedData) {
          setMeersensData(enhancedData);
          
          if (enhancedData.aqi > aqiData.aqi * 1.3) {
            playAlertSound('air');
            toast.warning("Enhanced AQI Alert", {
              description: `Enhanced AQI calculation shows a higher pollution level (${enhancedData.aqi}) than standard measurements.`,
              duration: 5000,
            });
          }
        }
      }
      
      const hourly = generateHourlyAQIForecast(aqiData.aqi);
      const daily = generateDailyAQIForecast(aqiData.aqi);
      
      setHourlyForecast(hourly);
      setDailyForecast(daily);
      
      const waterData = await getWaterQuality();
      setWaterQuality(waterData);
      
      checkWaterQualityAlert(waterData);
      
      const recommendations = getPersonalizedRecommendations(
        aqiData.aqi,
        hourly,
        userProfile
      );
      
      const healthRecommendations = getHealthBasedRecommendations(
        aqiData.aqi,
        userProfile.healthCondition || 'none'
      );
      
      setPersonalizedRecommendations({
        ...recommendations,
        healthRecommendations
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      
      toast.error("Error fetching data", {
        description: err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...profile };
      localStorage.setItem('user-profile', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshData = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
    
    const intervalId = setInterval(() => {
      fetchData();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (currentAQI && hourlyForecast.length > 0) {
      const recommendations = getPersonalizedRecommendations(
        currentAQI.aqi,
        hourlyForecast,
        userProfile
      );
      
      const healthRecommendations = getHealthBasedRecommendations(
        currentAQI.aqi,
        userProfile.healthCondition || 'none'
      );
      
      setPersonalizedRecommendations({
        ...recommendations,
        healthRecommendations
      });
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
    refreshData,
    meersensData,
    playAlertSound
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
