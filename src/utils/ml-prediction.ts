// This file contains mocks for ML prediction functionality
// In a real implementation, this would use TensorFlow.js or a similar ML library
import { HealthCondition } from "./aqi-calculator";

// Simulated hourly AQI values for today
export const generateHourlyAQIForecast = (currentAQI: number): { hour: number, aqi: number }[] => {
  const forecast = [];
  const now = new Date();
  const currentHour = now.getHours();
  
  // Generate for the next 24 hours
  for (let i = 0; i < 24; i++) {
    const hour = (currentHour + i) % 24;
    
    // Simulate AQI variation based on time of day
    // Early morning and late evening tend to have better air quality
    let hourlyVariation;
    if (hour >= 5 && hour <= 8) {
      // Early morning - improving
      hourlyVariation = -Math.random() * 10;
    } else if (hour >= 11 && hour <= 14) {
      // Midday - worse due to traffic and heat
      hourlyVariation = Math.random() * 15;
    } else if (hour >= 17 && hour <= 19) {
      // Evening rush hour - worse
      hourlyVariation = Math.random() * 10;
    } else if (hour >= 22 || hour <= 4) {
      // Late night - better
      hourlyVariation = -Math.random() * 8;
    } else {
      // Other times - slight variations
      hourlyVariation = (Math.random() * 10) - 5;
    }
    
    const predictedAQI = Math.max(1, Math.round(currentAQI + hourlyVariation));
    forecast.push({ hour, aqi: predictedAQI });
  }
  
  return forecast;
};

// Simulated 5-day AQI forecast
export const generateDailyAQIForecast = (currentAQI: number): { day: string, aqi: number }[] => {
  const forecast = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  
  for (let i = 0; i < 5; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);
    const dayName = days[forecastDate.getDay()];
    
    // Random variation for the next days
    const dailyVariation = (Math.random() * 30) - 15;
    const predictedAQI = Math.max(1, Math.round(currentAQI + dailyVariation));
    
    forecast.push({ day: dayName, aqi: predictedAQI });
  }
  
  return forecast;
};

// Simulate training data collection function
export const collectTrainingData = async (aqiData: any): Promise<void> => {
  console.log("Collecting training data:", aqiData);
  // In a real implementation, this would send the data to a server or store it locally
  localStorage.setItem('aqi-training-data', JSON.stringify({
    timestamp: new Date().toISOString(),
    data: aqiData
  }));
};

// Simulate model training
export const trainModel = async (): Promise<void> => {
  console.log("Training model with collected data...");
  // In a real implementation, this would use TensorFlow.js or a similar library
  // to train a model based on historical data
  
  // For now we just simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log("Model training complete");
};

// Get personalized recommendations based on user profile and current AQI
export interface UserProfile {
  hasSensitivities: boolean;
  activityLevel: 'low' | 'moderate' | 'high';
  typicalOutdoorHours: number[];
  healthCondition?: HealthCondition;
}

export const getPersonalizedRecommendations = (
  currentAQI: number,
  hourlyForecast: { hour: number, aqi: number }[],
  userProfile: UserProfile
): {
  recommendedHours: number[];
  personalAdvice: string[];
} => {
  // Filter hours based on user's activity level and AQI threshold
  let aqiThreshold;
  if (userProfile.hasSensitivities) {
    aqiThreshold = 50; // Lower threshold for sensitive individuals
  } else {
    switch (userProfile.activityLevel) {
      case 'low':
        aqiThreshold = 100;
        break;
      case 'moderate':
        aqiThreshold = 75;
        break;
      case 'high':
        aqiThreshold = 50; // Lower threshold for high activity
        break;
      default:
        aqiThreshold = 75;
    }
  }
  
  // Set even lower thresholds for certain health conditions
  if (userProfile.healthCondition) {
    switch(userProfile.healthCondition) {
      case 'asthma':
      case 'copd':
      case 'bronchitis':
        aqiThreshold = Math.min(aqiThreshold, 40); // Stricter threshold for respiratory conditions
        break;
      case 'heart-disease':
        aqiThreshold = Math.min(aqiThreshold, 50); // Stricter for heart conditions
        break;
      case 'allergy':
        aqiThreshold = Math.min(aqiThreshold, 60); // Somewhat stricter for allergies
        break;
      default:
        // Keep existing threshold
        break;
    }
  }
  
  // Filter forecast hours by user's typical outdoor hours and AQI threshold
  const filteredHours = hourlyForecast
    .filter(h => userProfile.typicalOutdoorHours.includes(h.hour) && h.aqi <= aqiThreshold)
    .sort((a, b) => a.aqi - b.aqi)
    .slice(0, 3)
    .map(h => h.hour);
  
  // Generate personalized advice
  const personalAdvice = [];
  
  if (filteredHours.length === 0) {
    personalAdvice.push("Today's air quality doesn't meet your health requirements.");
    personalAdvice.push("Consider indoor activities or using air purification.");
    
    if (userProfile.hasSensitivities) {
      personalAdvice.push("For sensitive individuals, wearing a mask is recommended if you must go outside.");
    }
    
    if (userProfile.healthCondition && userProfile.healthCondition !== 'none') {
      personalAdvice.push(`For your ${userProfile.healthCondition.replace('-', ' ')}, consider consulting your healthcare provider for specific guidance.`);
    }
  } else {
    personalAdvice.push(`Best hours for your outdoor activities: ${filteredHours.map(h => `${h}:00`).join(', ')}`);
    
    if (userProfile.activityLevel === 'high') {
      personalAdvice.push("For high-intensity activities, consider reducing duration if AQI rises above 50.");
    }
    
    if (userProfile.hasSensitivities) {
      personalAdvice.push("Monitor your breathing and symptoms even during recommended hours.");
    }
    
    if (userProfile.healthCondition && userProfile.healthCondition !== 'none') {
      personalAdvice.push(`With your ${userProfile.healthCondition.replace('-', ' ')}, stay vigilant about any unusual symptoms even during recommended hours.`);
    }
  }
  
  return {
    recommendedHours: filteredHours,
    personalAdvice
  };
};
