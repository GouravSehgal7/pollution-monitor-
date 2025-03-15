
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTrafficData, getTrafficHistory, getEnhancedAQIPrediction } from "@/utils/api";
import { useAQI } from "@/context/AQIContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Car, AlertTriangle, BarChart, Activity, MapPin } from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { format, parseISO } from "date-fns";
import TrafficMonitor from "@/components/TrafficMonitor";

const TrafficMonitoring = () => {
  useEffect(() => {
    document.title = "Traffic Monitoring | ClearAir Monitor";
  }, []);

  const { currentAQI, location } = useAQI();

  const { data: trafficData } = useQuery({
    queryKey: ["traffic"],
    queryFn: getTrafficData,
    refetchInterval: 30000,
  });

  const { data: trafficHistory } = useQuery({
    queryKey: ["trafficHistory"],
    queryFn: getTrafficHistory,
    refetchInterval: 60000,
  });

  const { data: enhancedAQI } = useQuery({
    queryKey: ["enhancedAQI", currentAQI?.aqi, location],
    queryFn: () => getEnhancedAQIPrediction(
      currentAQI?.aqi || 50, 
      location || { lat: 0, lng: 0 }
    ),
    enabled: !!currentAQI && !!location,
    refetchInterval: 60000,
  });

  // Format history data for charts
  const historyData = trafficHistory?.map((item) => ({
    time: format(parseISO(item.last_updated), "HH:mm"),
    date: format(parseISO(item.last_updated), "MMM dd"),
    hour: parseInt(format(parseISO(item.last_updated), "HH")),
    vehicles: item.vehicles_per_hour,
    congestion: item.congestion_level,
    pollution: item.pollution_factor,
  })) || [];

  // Get congestion color
  const getCongestionColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'severe': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Car className="mr-2" /> Traffic Monitoring
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <TrafficMonitor />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Traffic Impact on AQI</CardTitle>
              <CardDescription>How traffic affects air quality</CardDescription>
            </CardHeader>
            <CardContent>
              {enhancedAQI ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Base AQI vs Traffic-Enhanced AQI</div>
                    <div className="flex justify-center items-center space-x-4">
                      <div className="text-center">
                        <div className="text-xl font-bold">{enhancedAQI.original_aqi}</div>
                        <div className="text-xs text-muted-foreground">Original</div>
                      </div>
                      <div className="text-xl">→</div>
                      <div className="text-center">
                        <div className={`text-xl font-bold ${enhancedAQI.enhanced_aqi > enhancedAQI.original_aqi ? 'text-red-500' : 'text-green-500'}`}>
                          {enhancedAQI.enhanced_aqi}
                        </div>
                        <div className="text-xs text-muted-foreground">Traffic-adjusted</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Impact Factors:</div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Traffic</span>
                        <span className={enhancedAQI.factors.traffic > 1 ? 'text-red-500' : 'text-green-500'}>
                          {enhancedAQI.factors.traffic.toFixed(2)}x
                        </span>
                      </div>
                      <Progress 
                        value={enhancedAQI.factors.traffic * 50} 
                        indicatorClassName={enhancedAQI.factors.traffic > 1 ? 'bg-red-500' : 'bg-green-500'}
                        className="h-1"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Weather</span>
                        <span className={enhancedAQI.factors.weather > 1 ? 'text-red-500' : 'text-green-500'}>
                          {enhancedAQI.factors.weather.toFixed(2)}x
                        </span>
                      </div>
                      <Progress 
                        value={enhancedAQI.factors.weather * 50} 
                        indicatorClassName={enhancedAQI.factors.weather > 1 ? 'bg-red-500' : 'bg-green-500'}
                        className="h-1"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Time of Day</span>
                        <span className={enhancedAQI.factors.time_of_day > 1 ? 'text-red-500' : 'text-green-500'}>
                          {enhancedAQI.factors.time_of_day.toFixed(2)}x
                        </span>
                      </div>
                      <Progress 
                        value={enhancedAQI.factors.time_of_day * 50} 
                        indicatorClassName={enhancedAQI.factors.time_of_day > 1 ? 'bg-red-500' : 'bg-green-500'}
                        className="h-1"
                      />
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    Last calculated: {format(parseISO(enhancedAQI.timestamp), 'HH:mm:ss')}
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading AQI prediction data...</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Traffic Patterns</CardTitle>
              <CardDescription>Recent traffic volume trends</CardDescription>
            </CardHeader>
            <CardContent className="h-[230px]">
              {historyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="vehicles" 
                      name="Vehicles/Hour" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No traffic history data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <Tabs defaultValue="hourly">
            <TabsList className="mb-4">
              <TabsTrigger value="hourly">Hourly Analysis</TabsTrigger>
              <TabsTrigger value="pollution">Pollution Impact</TabsTrigger>
              <TabsTrigger value="peak">Peak Hours</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hourly" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Traffic Analysis</CardTitle>
                  <CardDescription>Traffic volumes throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="vehicles" 
                          name="Traffic Volume" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pollution" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pollution Impact Analysis</CardTitle>
                  <CardDescription>How traffic correlates with pollution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="time" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="vehicles" 
                          name="Traffic Volume" 
                          stroke="#8884d8" 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="pollution" 
                          name="Pollution Factor" 
                          stroke="#82ca9d" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="peak" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Traffic Hours</CardTitle>
                  <CardDescription>Traffic distribution by hour of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="vehicles" 
                          name="Traffic Volume" 
                          fill="#8884d8" 
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {trafficData?.congestion_level === 'severe' && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Severe Traffic Alert</AlertTitle>
            <AlertDescription>
              Current traffic congestion is severe with {trafficData.vehicles_per_hour} vehicles per hour.
              This is significantly increasing pollution levels in your area.
              Consider using alternate routes or delaying non-essential travel.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Traffic Impact Information</CardTitle>
            <CardDescription>How traffic affects air quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Traffic and Air Pollution</h3>
                <p className="text-sm text-muted-foreground">
                  Traffic is a major contributor to urban air pollution. Vehicles emit nitrogen oxides (NOx), 
                  particulate matter (PM2.5 and PM10), carbon monoxide (CO), and volatile organic compounds (VOCs).
                  These pollutants can significantly worsen air quality, especially during peak traffic hours.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Congestion Levels</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> <strong>Low:</strong> Free-flowing traffic with minimal delays. Low impact on air quality.<br />
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span> <strong>Moderate:</strong> Some slowdowns but generally steady flow. Moderate impact on air quality.<br />
                  <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span> <strong>High:</strong> Significant slowdowns with periodic stopping. High impact on air quality.<br />
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span> <strong>Severe:</strong> Gridlock conditions with extended idling. Severe impact on air quality.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Pollution Factor</h3>
                <p className="text-sm text-muted-foreground">
                  The pollution factor represents how much traffic is amplifying local air pollution. A factor of 1.0 means 
                  no amplification, while higher values indicate that traffic is worsening air quality. Factors above 2.0
                  suggest significant traffic-related pollution that may require precautionary measures.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrafficMonitoring;
