
import { useEffect, useState } from "react";
import { useAQI } from "@/context/AQIContext";
import { getAQICategory } from "@/utils/aqi-calculator";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AQIChart = () => {
  const { hourlyForecast, dailyForecast } = useAQI();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  // Prepare hourly data
  const hourlyData = hourlyForecast.map(item => {
    const category = getAQICategory(item.aqi);
    return {
      hour: `${item.hour}:00`,
      aqi: item.aqi,
      category
    };
  });
  
  // Format hour labels nicely
  const formatHour = (hour: string) => {
    const h = parseInt(hour.split(':')[0]);
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  };
  
  // Get color based on AQI category
  const getColor = (aqi: number) => {
    const category = getAQICategory(aqi);
    switch (category) {
      case 'good': return '#A8E05F';
      case 'moderate': return '#FDD74B';
      case 'unhealthy': return '#FE9B57';
      case 'very-unhealthy': return '#FE6A69';
      case 'hazardous': return '#A97ABC';
      default: return '#A8E05F';
    }
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const category = getAQICategory(data.aqi);
      const categoryInfo = {
        good: 'Good',
        moderate: 'Moderate',
        unhealthy: 'Unhealthy for Sensitive Groups',
        'very-unhealthy': 'Unhealthy',
        hazardous: 'Very Unhealthy'
      }[category];
      
      return (
        <div className="glass p-3 rounded-md shadow-md border border-border">
          <p className="font-medium">{formatHour(label)}</p>
          <p className="text-sm">AQI: <span className="font-semibold">{data.aqi}</span></p>
          <p className="text-xs mt-1" style={{ color: getColor(data.aqi) }}>
            {categoryInfo}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="glass w-full h-full overflow-hidden card-transition hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          Air Quality Forecast
          <div className="ml-2 h-2 w-2 rounded-full bg-primary animate-pulse-gentle"></div>
        </CardTitle>
        <CardDescription>
          Hourly and daily AQI predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="daily">5-Day</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hourly" className="mt-0 space-y-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hourlyData}
                  margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={formatHour} 
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={[0, 'dataMax + 20']} 
                    tick={{ fontSize: 12 }} 
                    tickCount={6} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="aqi" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="url(#colorAqi)" 
                    isAnimationActive={true}
                    activeDot={{ r: 6, fill: "#3B82F6", strokeWidth: 1 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="daily" className="mt-0 space-y-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyForecast}
                  margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }} 
                  />
                  <YAxis 
                    domain={[0, 'dataMax + 20']} 
                    tick={{ fontSize: 12 }} 
                    tickCount={6} 
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="aqi" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3B82F6", strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: "#3B82F6", strokeWidth: 2 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AQIChart;
