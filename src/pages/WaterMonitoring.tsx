
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWaterQuality, getWaterQualityHistory } from "@/utils/api";
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
import { AlertTriangle, Droplet, BarChart, Activity } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import WaterQualityMonitor from "@/components/WaterQualityMonitor";

const WaterMonitoring = () => {
  useEffect(() => {
    document.title = "Water Quality Monitoring | ClearAir Monitor";
  }, []);

  const { data: waterData } = useQuery({
    queryKey: ["waterQuality"],
    queryFn: getWaterQuality,
    refetchInterval: 30000,
  });

  const { data: waterHistory } = useQuery({
    queryKey: ["waterQualityHistory"],
    queryFn: getWaterQualityHistory,
    refetchInterval: 60000,
  });

  // Format history data for charts
  const historyData = waterHistory?.map((item) => ({
    time: format(parseISO(item.timestamp || item.last_updated || ""), "HH:mm"),
    date: format(parseISO(item.timestamp || item.last_updated || ""), "MMM dd"),
    hour: parseInt(format(parseISO(item.timestamp || item.last_updated || ""), "HH")),
    index: item.index,
    status: item.status,
    safe: item.safe,
  })) || [];
  
  // Get stats for parameters
  const getParameterStats = (param) => {
    if (!waterData?.parameters) return { current: 0, safe: true };
    
    const value = waterData.parameters[param] || 0;
    let safe = true;
    let min = 0;
    let max = 100;
    
    // Define safety ranges for different parameters
    switch(param) {
      case 'ph': 
        safe = value >= 6.5 && value <= 8.5;
        min = 0; max = 14;
        break;
      case 'turbidity': 
        safe = value < 5;
        min = 0; max = 10;
        break;
      case 'dissolved_oxygen': 
        safe = value > 5;
        min = 0; max = 15;
        break;
      case 'conductivity': 
        safe = value < 800;
        min = 0; max = 1000;
        break;
      case 'nitrates': 
        safe = value < 10;
        min = 0; max = 20;
        break;
      case 'e_coli': 
        safe = value < 10;
        min = 0; max = 100;
        break;
      default:
        break;
    }
    
    return { current: value, safe, min, max };
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Droplet className="mr-2" /> Water Quality Monitoring
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <WaterQualityMonitor />
          
          {waterData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parameters Analysis</CardTitle>
                <CardDescription>Detailed water parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {waterData.parameters && Object.entries(waterData.parameters).map(([key, _]) => {
                    const stats = getParameterStats(key);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                          <span className={`text-sm font-medium ${stats.safe ? 'text-green-500' : 'text-red-500'}`}>
                            {stats.current}
                          </span>
                        </div>
                        <Progress 
                          value={(stats.current / stats.max) * 100} 
                          indicatorClassName={stats.safe ? 'bg-green-500' : 'bg-red-500'}
                          className="h-1"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">24-Hour Trend</CardTitle>
              <CardDescription>Water quality over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={historyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <defs>
                      <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="index" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorIndex)" 
                      name="Quality Index"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <Tabs defaultValue="hourly">
            <TabsList className="mb-4">
              <TabsTrigger value="hourly">Hourly Analysis</TabsTrigger>
              <TabsTrigger value="daily">Daily Patterns</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hourly" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Water Quality Analysis</CardTitle>
                  <CardDescription>Water quality fluctuations throughout the day</CardDescription>
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
                          dataKey="index" 
                          name="Water Quality Index" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="daily" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Water Quality Patterns</CardTitle>
                  <CardDescription>Average daily water quality readings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="index" 
                          name="Water Quality Index" 
                          fill="#8884d8" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="distribution" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Distribution</CardTitle>
                  <CardDescription>Distribution of water quality readings by hour</CardDescription>
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
                          dataKey="index" 
                          name="Water Quality Index" 
                          fill="#82ca9d" 
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {waterData && !waterData.safe && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Water Quality Warning</AlertTitle>
            <AlertDescription>
              Current water quality index is {waterData.index}, which is considered {waterData.status}.
              This level is not safe for consumption without proper treatment. Please take necessary precautions.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Water Quality Information</CardTitle>
            <CardDescription>Understanding water quality parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">pH Level</h3>
                <p className="text-sm text-muted-foreground">
                  pH is a measure of how acidic or basic water is. The range goes from 0 to 14, with 7 being neutral.
                  Less than 7 indicates acidity, greater than 7 indicates alkalinity. Safe drinking water should have a pH between 6.5 and 8.5.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Turbidity</h3>
                <p className="text-sm text-muted-foreground">
                  Turbidity measures the cloudiness or haziness of water caused by suspended particles. High turbidity can provide hiding places
                  for harmful microorganisms and inhibit disinfection processes. Safe drinking water typically has a turbidity below 5 NTU.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Dissolved Oxygen</h3>
                <p className="text-sm text-muted-foreground">
                  Dissolved oxygen indicates the level of oxygen in water. Healthy water typically has dissolved oxygen levels above 5 mg/L.
                  Low levels can indicate pollution and are dangerous for aquatic life.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Conductivity</h3>
                <p className="text-sm text-muted-foreground">
                  Conductivity measures water's ability to conduct electricity, indicating the amount of dissolved solids.
                  Drinking water typically has conductivity between 50-800 μS/cm. Higher levels may indicate pollution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaterMonitoring;
