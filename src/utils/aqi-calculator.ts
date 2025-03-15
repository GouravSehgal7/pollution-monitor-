
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

// Health conditions
export type HealthCondition = 'asthma' | 'bronchitis' | 'copd' | 'heart-disease' | 'allergy' | 'none';

// Get health-specific recommendations based on AQI and health condition
export const getHealthBasedRecommendations = (aqi: number, condition: HealthCondition): string[] => {
  const category = getAQICategory(aqi);
  const recommendations: Record<HealthCondition, Record<AQICategory, string[]>> = {
    'asthma': {
      'good': [
        'Good air quality - regular activities are fine',
        'Ensure you have your reliever inhaler with you as a precaution',
        'Monitor your symptoms if you spend extended time outdoors'
      ],
      'moderate': [
        'Consider using your preventer inhaler before going outdoors',
        'Take breaks during physical activities',
        'Carry your reliever inhaler at all times'
      ],
      'unhealthy': [
        'Limit outdoor activities to 30 minutes or less',
        'Use your preventer inhaler as prescribed',
        'Consider wearing an N95 mask outdoors',
        'Stay hydrated to keep airways moist'
      ],
      'very-unhealthy': [
        'Stay indoors with windows closed',
        'Use air purifiers with HEPA filters',
        'Take preventive doses of medications if prescribed by your doctor',
        'Keep reliever medication readily accessible'
      ],
      'hazardous': [
        'Do not go outdoors unless absolutely necessary',
        'Contact your healthcare provider for additional precautions',
        'Monitor peak flow readings more frequently',
        'If you experience symptoms, follow your asthma action plan immediately'
      ]
    },
    'bronchitis': {
      'good': [
        'You can engage in normal outdoor activities',
        'Stay hydrated to help keep airway mucus thin',
        'Consider gentle respiratory exercises in fresh air'
      ],
      'moderate': [
        'Limit vigorous outdoor activities',
        'Increase fluid intake to help thin mucus secretions',
        'Monitor for any increase in coughing or mucus production'
      ],
      'unhealthy': [
        'Stay indoors during peak pollution hours',
        'Use a humidifier to keep airways moist',
        'Take any prescribed medications regularly',
        'Avoid smoking areas and other irritants'
      ],
      'very-unhealthy': [
        'Remain indoors with air purification',
        'Consider wearing an N95 mask if you must go outside',
        'Contact your healthcare provider if symptoms worsen',
        'Use steam inhalation to help clear airways'
      ],
      'hazardous': [
        'Do not go outdoors',
        'If breathing becomes difficult, seek medical attention',
        'Use prescribed bronchodilators as directed',
        'Avoid all respiratory irritants'
      ]
    },
    'copd': {
      'good': [
        'Good opportunity for outdoor breathing exercises',
        'Ensure oxygen equipment is with you if prescribed',
        'Practice pursed-lip breathing in fresh air'
      ],
      'moderate': [
        'Limit outdoor exposure to 1-2 hours',
        'Use rescue inhalers before going outside if needed',
        'Monitor oxygen levels if you have an oximeter'
      ],
      'unhealthy': [
        'Stay indoors with air filtration',
        'Use supplemental oxygen as prescribed',
        'Keep all medications within easy reach',
        'Avoid areas with smoke, dust, or strong odors'
      ],
      'very-unhealthy': [
        'Do not leave home unless medically necessary',
        'Use air purifiers in your living space',
        'Increase medication as directed in your action plan',
        'Contact your pulmonologist for advice'
      ],
      'hazardous': [
        'Stay indoors with filtered air',
        'Consider evacuation to an area with better air quality if possible',
        'Seek immediate medical help if you experience increased difficulty breathing',
        'Use your emergency action plan as directed by your healthcare provider'
      ]
    },
    'heart-disease': {
      'good': [
        'Good air quality for cardiac rehabilitation exercises',
        'Maintain your regular medication schedule',
        'Stay properly hydrated during outdoor activities'
      ],
      'moderate': [
        'Monitor your heart rate during outdoor activities',
        'Take more frequent rest breaks',
        'Keep nitroglycerin or other emergency medication with you'
      ],
      'unhealthy': [
        'Avoid outdoor exertion',
        'Monitor blood pressure more frequently',
        'Stay in air-conditioned environments',
        'Watch for unusual symptoms like increased fatigue or chest discomfort'
      ],
      'very-unhealthy': [
        'Remain indoors',
        'Postpone any non-essential travel',
        'Follow your cardiac care plan closely',
        'Contact your cardiologist if you notice any changes in symptoms'
      ],
      'hazardous': [
        'Do not go outdoors',
        'Ensure you have sufficient medication supplies',
        'Have emergency contact information readily available',
        'If you experience chest pain, shortness of breath, or unusual symptoms, seek emergency care immediately'
      ]
    },
    'allergy': {
      'good': [
        'Good time for outdoor activities, but monitor pollen counts',
        'Consider wearing sunglasses to protect eyes from allergens',
        'Shower after spending time outdoors to remove allergens'
      ],
      'moderate': [
        'Take antihistamines before going outside if recommended by your doctor',
        'Limit outdoor time during high pollen hours (typically 5-10 AM)',
        'Rinse sinuses with saline after outdoor exposure'
      ],
      'unhealthy': [
        'Stay indoors with windows closed, especially during windy days',
        'Use air purifiers with HEPA filters',
        'Consider wearing a mask outdoors',
        'Take prescribed allergy medications regularly'
      ],
      'very-unhealthy': [
        'Avoid all outdoor activities',
        'Use air conditioning instead of opening windows',
        'Shower and change clothes if you've been outdoors',
        'Monitor for increased allergy symptoms or asthmatic responses'
      ],
      'hazardous': [
        'Stay indoors with air purification',
        'Contact your allergist if symptoms become severe',
        'Keep rescue medications accessible',
        'Consider wearing a mask even indoors if air filtration is inadequate'
      ]
    },
    'none': {
      'good': [
        'Enjoy outdoor activities without restrictions',
        'Great time for exercise and recreation',
        'No special precautions needed'
      ],
      'moderate': [
        'Most people can continue normal activities',
        'Stay hydrated when outdoors',
        'Monitor for any unusual respiratory symptoms'
      ],
      'unhealthy': [
        'Consider reducing prolonged outdoor exertion',
        'Take more frequent breaks during outdoor activities',
        'People with occasional respiratory issues should be cautious'
      ],
      'very-unhealthy': [
        'Limit outdoor activities when possible',
        'Consider wearing masks for necessary outdoor trips',
        'Use air purifiers indoors',
        'Monitor for any respiratory symptoms'
      ],
      'hazardous': [
        'Avoid outdoor activities',
        'Wear N95 masks if you must go outside',
        'Keep windows and doors closed',
        'Everyone should monitor for respiratory symptoms'
      ]
    }
  };

  return recommendations[condition][category];
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
