
import { useAQI } from "@/context/AQIContext";
import { getAQICategory } from "@/utils/aqi-calculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Droplets, Gauge, Activity, Wind, Factory, Car } from "lucide-react";
import { useEffect, useState } from "react";

const EnhancedAQIMonitor = () => {
  const { currentAQI, meersensData } = useAQI();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!currentAQI) return null;

  const standardAQI = currentAQI.aqi;
  const enhancedAQI = meersensData?.aqi || standardAQI;
  const difference = enhancedAQI - standardAQI;
  const percentDifference = standardAQI > 0 ? Math.round((difference / standardAQI) * 100) : 0;

  const getProgressColor = (aqi: number) => {
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

  const standardAQIColor = getProgressColor(standardAQI);
  const enhancedAQIColor = getProgressColor(enhancedAQI);

  return (
    <Card className="glass w-full h-full overflow-hidden card-transition hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          Enhanced AQI Analysis
          <div className="ml-2 h-2 w-2 rounded-full bg-orange-400 animate-pulse-gentle"></div>
        </CardTitle>
        <CardDescription>
          Standard vs. Traffic & Environmental Factors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <div className="flex items-center">
              <Gauge className="h-4 w-4 mr-1" />
              <span>Standard AQI</span>
            </div>
            <span>{standardAQI}</span>
          </div>
          <Progress 
            value={Math.min(100, (standardAQI / 300) * 100)} 
            className="h-2" 
            indicatorClassName={standardAQIColor}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              <span>Enhanced AQI</span>
            </div>
            <div className="flex items-center">
              <span>{enhancedAQI}</span>
              {difference !== 0 && (
                <span className={`ml-2 text-xs ${difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {difference > 0 ? '+' : ''}{difference} ({percentDifference}%)
                </span>
              )}
            </div>
          </div>
          <Progress 
            value={Math.min(100, (enhancedAQI / 300) * 100)} 
            className="h-2" 
            indicatorClassName={enhancedAQIColor}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h4 className="text-sm font-medium mb-3">Contributing Factors</h4>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="glass p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-center">
                <Car className="h-5 w-5 mb-1 text-blue-500" />
                <span className="text-xs text-center">Traffic</span>
                <span className="text-sm font-medium">
                  {meersensData?.additional_factors.traffic_impact.toFixed(2) || "1.00"}x
                </span>
              </div>
            </div>
            
            <div className="glass p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-center">
                <Factory className="h-5 w-5 mb-1 text-purple-500" />
                <span className="text-xs text-center">Industrial</span>
                <span className="text-sm font-medium">
                  {meersensData?.additional_factors.industrial_proximity.toFixed(2) || "1.00"}x
                </span>
              </div>
            </div>
            
            <div className="glass p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-center">
                <Wind className="h-5 w-5 mb-1 text-teal-500" />
                <span className="text-xs text-center">Weather</span>
                <span className="text-sm font-medium">
                  {meersensData?.additional_factors.weather_influence.toFixed(2) || "1.00"}x
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAQIMonitor;
