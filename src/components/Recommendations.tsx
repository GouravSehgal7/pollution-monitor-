
import { useAQI } from "@/context/AQIContext";
import { getRecommendations, getAQICategory } from "@/utils/aqi-calculator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, CheckCircle, Users, ArrowRight } from "lucide-react";

const Recommendations = () => {
  const { currentAQI, personalizedRecommendations, hourlyForecast } = useAQI();
  
  if (!currentAQI) return null;
  
  const aqiValue = currentAQI.aqi;
  const recommendations = getRecommendations(aqiValue);
  
  // Format hour
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };
  
  // Get AQI for a specific hour
  const getAqiForHour = (hour: number) => {
    const hourData = hourlyForecast.find(data => data.hour === hour);
    return hourData ? hourData.aqi : null;
  };
  
  return (
    <Card className="glass w-full h-full overflow-hidden card-transition hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          Recommendations
        </CardTitle>
        <CardDescription>
          Personalized advice based on current conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] overflow-y-auto">
        {/* Best times to go outside */}
        {personalizedRecommendations && personalizedRecommendations.recommendedHours.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-medium flex items-center mb-3">
              <Clock size={16} className="mr-2 text-primary" />
              Best Times to Go Outside
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {personalizedRecommendations.recommendedHours.map(hour => {
                const hourAqi = getAqiForHour(hour);
                const category = hourAqi ? getAQICategory(hourAqi) : 'good';
                
                return (
                  <div 
                    key={hour} 
                    className="glass p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="font-medium">{formatHour(hour)}</div>
                    {hourAqi && (
                      <div className={`
                        text-xs px-2 py-0.5 rounded-full 
                        ${category === 'good' ? 'bg-aqi-good text-black' : ''}
                        ${category === 'moderate' ? 'bg-aqi-moderate text-black' : ''}
                        ${category === 'unhealthy' ? 'bg-aqi-unhealthy text-white' : ''}
                        ${category === 'very-unhealthy' ? 'bg-aqi-very-unhealthy text-white' : ''}
                        ${category === 'hazardous' ? 'bg-aqi-hazardous text-white' : ''}
                      `}>
                        AQI {hourAqi}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* General recommendations */}
        <div className="mb-6">
          <h3 className="text-base font-medium flex items-center mb-3">
            <Users size={16} className="mr-2 text-primary" />
            General Recommendations
          </h3>
          
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle size={16} className="mr-2 mt-0.5 text-primary" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Personalized advice */}
        {personalizedRecommendations && (
          <div>
            <h3 className="text-base font-medium flex items-center mb-3">
              <ArrowRight size={16} className="mr-2 text-primary" />
              Personalized Advice
            </h3>
            
            <ul className="space-y-2">
              {personalizedRecommendations.personalAdvice.map((advice, index) => (
                <li key={index} className="flex items-start">
                  <div className="min-w-4 mr-2 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
                  </div>
                  <span className="text-sm">{advice}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Recommendations;
