
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrafficData, getTrafficHistory, TrafficData } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Car, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const TrafficMonitor: React.FC = () => {
  const [playAlert, setPlayAlert] = useState(false);

  const { data: trafficData, isLoading: trafficLoading } = useQuery({
    queryKey: ['traffic'],
    queryFn: getTrafficData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: trafficHistory } = useQuery({
    queryKey: ['trafficHistory'],
    queryFn: getTrafficHistory,
    refetchInterval: 60000, // Refresh every minute
  });

  // Format traffic history data for chart
  const chartData = trafficHistory?.map((item: TrafficData) => ({
    time: format(parseISO(item.last_updated), 'HH:mm'),
    vehicles: item.vehicles_per_hour,
    factor: item.pollution_factor
  })) || [];

  // Get traffic congestion color
  const getCongestionColor = (level: string) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'severe': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get pollution factor severity
  const getPollutionSeverity = (factor: number) => {
    if (factor < 1.0) return { color: 'text-green-500', text: 'Low Impact' };
    if (factor < 1.5) return { color: 'text-yellow-500', text: 'Moderate Impact' };
    if (factor < 2.0) return { color: 'text-orange-500', text: 'High Impact' };
    return { color: 'text-red-500', text: 'Severe Impact' };
  };

  // Show alert for severe congestion
  useEffect(() => {
    if (trafficData?.congestion_level?.toLowerCase() === 'severe' && trafficData?.pollution_factor > 2.0) {
      toast.warning("Severe Traffic Congestion", {
        description: "High traffic is significantly increasing pollution levels",
        duration: 5000,
      });
      setPlayAlert(true);
    } else {
      setPlayAlert(false);
    }
  }, [trafficData]);

  // Play alert sound
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    
    if (playAlert) {
      audio = new Audio('/alert-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Error playing audio", e));
    }
    
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [playAlert]);

  const pollutionInfo = trafficData ? getPollutionSeverity(trafficData.pollution_factor) : { color: 'text-gray-500', text: 'Unknown' };

  return (
    <Card className="glass card-transition hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Car className="mr-2" size={18} />
          Traffic Monitoring
          {trafficData?.congestion_level?.toLowerCase() === 'severe' && (
            <AlertTriangle className="ml-2 text-red-500" size={18} />
          )}
        </CardTitle>
        <CardDescription>Real-time traffic conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trafficLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading traffic data...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Congestion Level:</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getCongestionColor(trafficData?.congestion_level || '')}`}>
                    {trafficData?.congestion_level || 'Unknown'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vehicles per hour:</span>
                  <span className="font-medium">{trafficData?.vehicles_per_hour || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pollution Factor:</span>
                  <span className={`font-medium ${pollutionInfo.color}`}>
                    {trafficData?.pollution_factor.toFixed(1) || '0'} ({pollutionInfo.text})
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground text-right">
                  Last updated: {trafficData?.last_updated ? format(parseISO(trafficData.last_updated), 'HH:mm:ss') : 'Unknown'}
                </div>
              </div>
              
              {chartData.length > 0 && (
                <div className="h-[140px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.slice(-12)} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="vehicles" stroke="#8884d8" name="Vehicles/h" />
                      <Line yAxisId="right" type="monotone" dataKey="factor" stroke="#82ca9d" name="Pollution Factor" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficMonitor;
