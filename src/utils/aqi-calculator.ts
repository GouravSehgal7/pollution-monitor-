
// AQI categories and ranges
export type AQICategory = 'good' | 'moderate' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export const AQI_CATEGORIES = {
  good: { min: 0, max: 50, label: 'Good', description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.' },
  moderate: { min: 51, max: 100, label: 'Moderate', description: 'Air quality is acceptable; however, there may be some health concerns for a small number of people.' },
  unhealthy: { min: 101, max: 150, label: 'Unhealthy for Sensitive Groups', description: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.' },
  'very-unhealthy': { min: 151, max: 200, label: 'Unhealthy', description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.' },
  hazardous: { min: 201, max: 300, label: 'Very Unhealthy', description: 'Health alert: everyone may experience more serious health effects.' }
};

// Get AQI category based on AQI value
export const getAQICategory = (aqi: number): AQICategory => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy';
  if (aqi <= 200) return 'very-unhealthy';
  return 'hazardous';
};

// Generate specific recommendations based on AQI level
export const getRecommendations = (aqi: number): string[] => {
  const category = getAQICategory(aqi);
  
  const recommendations = {
    good: [
      'Enjoy outdoor activities',
      'Perfect air quality for exercising outside',
      'No restrictions on outdoor activities'
    ],
    moderate: [
      'Sensitive individuals should consider reducing prolonged outdoor exertion',
      'It\'s a good day for most outdoor activities',
      'Consider morning or evening for strenuous exercises'
    ],
    unhealthy: [
      'People with respiratory or heart disease, the elderly and children should limit prolonged outdoor exertion',
      'Consider rescheduling strenuous outdoor activities',
      'Keep windows closed to prevent outdoor air pollution from coming inside'
    ],
    'very-unhealthy': [
      'Avoid prolonged or heavy exertion',
      'Move activities indoors or reschedule to a time when the air quality is better',
      'Use air purifiers indoors to maintain clean air',
      'Wear a mask if you must go outside'
    ],
    hazardous: [
      'Avoid all physical activity outdoors',
      'Remain indoors with windows and doors closed',
      'Use air purifiers with HEPA filters',
      'Wear a properly fitted N95 mask if you must go outside',
      'Follow public health advice and stay informed'
    ]
  };

  return recommendations[category];
};

// Calculate best time to go outside based on AQI forecast
export const calculateBestTimeToGoOut = (forecasts: { hour: number; aqi: number }[]): number[] => {
  // Return the hours with the lowest AQI values
  const sortedForecasts = [...forecasts].sort((a, b) => a.aqi - b.aqi);
  return sortedForecasts.slice(0, 3).map(f => f.hour);
};

// Water quality index evaluation
export const evaluateWaterQuality = (index: number): {
  status: string;
  description: string;
  safe: boolean;
} => {
  if (index <= 25) {
    return {
      status: 'Excellent',
      description: 'Water quality is excellent. Suitable for all uses.',
      safe: true
    };
  } else if (index <= 50) {
    return {
      status: 'Good',
      description: 'Water quality is good. Suitable for most uses.',
      safe: true
    };
  } else if (index <= 75) {
    return {
      status: 'Fair',
      description: 'Water quality is fair. Some treatment may be required for certain uses.',
      safe: true
    };
  } else {
    return {
      status: 'Poor',
      description: 'Water quality is poor. Avoid use without proper treatment.',
      safe: false
    };
  }
};
