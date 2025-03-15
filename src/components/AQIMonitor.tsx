
import { useAQI } from "@/context/AQIContext";
import { getAQICategory } from "@/utils/aqi-calculator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Gauge } from "lucide-react";
import { useEffect, useState } from "react";

const AQIMonitor = () => {
  const { currentAQI, loading, error } = useAQI();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getAQIColor = (aqi: number) => {
    const category = getAQICategory(aqi);
    switch (category) {
      case 'good': return 'bg-aqi-good';
      case 'moderate': return 'bg-aqi-moderate';
      case 'unhealthy': return 'bg-aqi-unhealthy';
      case 'very-unhealthy': return 'bg-aqi-very-unhealthy';
      case 'hazardous': return 'bg-aqi-hazardous';
      default: return 'bg-primary';
    }
  };

  const getAQIText = (aqi: number) => {
    const category = getAQICategory(aqi);
    switch (category) {
      case 'good': return 'Good';
      case 'moderate': return 'Moderate';
      case 'unhealthy': return 'Unhealthy';
      case 'very-unhealthy': return 'Very Unhealthy';
      case 'hazardous': return 'Hazardous';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="glass w-full h-full overflow-hidden card-transition hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Gauge className="h-5 w-5 mr-2" />
          Air Quality Index
        </CardTitle>
        <CardDescription>
          Current AQI levels in your area
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <AlertTriangle className="h-10 w-10 text-orange-500 mb-2" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}
        
        {!loading && !error && currentAQI && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold">{currentAQI.aqi}</div>
              <div className={`text-lg font-medium mt-1 ${
                getAQICategory(currentAQI.aqi) === 'good' ? 'text-green-500' : 
                getAQICategory(currentAQI.aqi) === 'moderate' ? 'text-yellow-500' : 
                getAQICategory(currentAQI.aqi) === 'unhealthy' ? 'text-orange-500' : 
                getAQICategory(currentAQI.aqi) === 'very-unhealthy' ? 'text-red-500' : 
                'text-purple-500'
              }`}>
                {getAQIText(currentAQI.aqi)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Updated {new Date(currentAQI.time * 1000).toLocaleTimeString()}
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={Math.min(100, (Number(currentAQI.aqi) / 300) * 100)} 
                className="h-2.5"
                indicatorClassName={getAQIColor(currentAQI.aqi)}
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>150</span>
                <span>300+</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>PM2.5</span>
                  <span>{currentAQI.iaqi.pm25?.v ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>PM10</span>
                  <span>{currentAQI.iaqi.pm10?.v ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Ozone</span>
                  <span>{currentAQI.iaqi.o3?.v ?? 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AQIMonitor;
