
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWaterQuality, getWaterQualityHistory, WaterQualityData } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Droplet, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const WaterQualityMonitor: React.FC = () => {
  const [playAlert, setPlayAlert] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { data: waterData, isLoading: waterLoading } = useQuery({
    queryKey: ['waterQuality'],
    queryFn: getWaterQuality,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: waterHistory } = useQuery({
    queryKey: ['waterQualityHistory'],
    queryFn: getWaterQualityHistory,
    refetchInterval: 60000, // Refresh every minute
  });

  // Format water history data for chart
  const chartData = waterHistory?.map((item: WaterQualityData) => ({
    time: format(parseISO(item.timestamp || item.last_updated || ''), 'HH:mm'),
    index: item.index,
    safe: item.safe ? 1 : 0
  })) || [];

  // Get water quality color
  const getQualityColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'excellent': return 'bg-blue-500';
      case 'good': return 'bg-green-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Show alert for unsafe water
  useEffect(() => {
    if (waterData && !waterData.safe) {
      toast.error("Water Quality Alert", {
        description: "Water quality has fallen below safe levels",
        duration: 8000,
      });
      setPlayAlert(true);
    } else {
      setPlayAlert(false);
    }
  }, [waterData]);

  // Play alert sound
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    
    if (playAlert) {
      audio = new Audio('/alarm-sound.mp3');
      audio.volume = 0.7;
      audio.loop = true;
      audio.play().catch(e => console.error("Error playing audio", e));
    }
    
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [playAlert]);

  return (
    <Card className="glass card-transition hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Droplet className="mr-2" size={18} />
          Water Quality
          {waterData && !waterData.safe && (
            <AlertTriangle className="ml-2 text-red-500" size={18} />
          )}
        </CardTitle>
        <CardDescription>Real-time water quality monitoring</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {waterLoading ? (
            <div className="h-[120px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading water quality data...</p>
            </div>
          ) : (
            <>
              {waterData && !waterData.safe && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Water Quality Warning</AlertTitle>
                  <AlertDescription>
                    Water quality has fallen to unsafe levels. Avoid consumption without proper treatment.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold tracking-tight">{waterData?.index || 0}</div>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${getQualityColor(waterData?.status || '')}`}>
                    {waterData?.status || 'Unknown'}
                  </div>
                </div>
                
                <Progress 
                  value={(waterData?.index || 0) / 100 * 100} 
                  indicatorClassName={getQualityColor(waterData?.status || '')}
                  className="h-1.5"
                />
                
                <button 
                  className="text-xs flex items-center text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide details' : 'Show details'}
                  {showDetails ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                </button>
                
                {showDetails && waterData?.parameters && (
                  <div className="space-y-2 pt-2 text-sm border-t border-border/50">
                    {Object.entries(waterData.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground text-right">
                  Last updated: {waterData?.last_updated ? format(parseISO(waterData.last_updated), 'HH:mm:ss') : 'Unknown'}
                </div>
              </div>
              
              {chartData.length > 0 && (
                <div className="h-[140px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.slice(-12)} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <defs>
                        <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="index" stroke="#8884d8" fillOpacity={1} fill="url(#colorIndex)" />
                    </AreaChart>
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

export default WaterQualityMonitor;
