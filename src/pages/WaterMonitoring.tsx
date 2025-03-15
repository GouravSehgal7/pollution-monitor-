import { useEffect, useState } from "react";
import { useAQI } from "@/context/AQIContext";
import { getWaterQualityHistory, WaterQualityData } from "@/utils/api";
import { evaluateWaterQuality } from "@/utils/aqi-calculator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropletIcon,
  ClockIcon,
  AlertTriangleIcon,
  BarChart as BarChartIcon,
  TableIcon,
  RefreshCwIcon,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import WaterQualityMonitor from "@/components/WaterQualityMonitor";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/Header";

const WaterMonitoring = () => {
  useEffect(() => {
    document.title = "Water Quality Monitoring";
  }, []);

  const [historyData, setHistoryData] = useState<
    { date: string; time: string; index: number; status: string; safe: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { waterQuality, refreshData } = useAQI();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWaterQualityHistory();
        const formattedData = data.map((item) => ({
          date: format(parseISO(item.timestamp), "MM/dd/yyyy"),
          time: format(parseISO(item.timestamp), "HH:mm"),
          index: item.index,
          status: item.status,
          safe: item.safe,
        }));
        setHistoryData(formattedData);
      } catch (err) {
        setError("Failed to load water quality history");
        console.error("Error fetching water quality history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleRefresh = async () => {
    await refreshData();
  };

  const today = new Date();
  const lastWeek = subDays(today, 7);

  return (
    <div className="container mx-auto p-4">
      <Header/>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 flex items-center">
          <DropletIcon className="h-6 w-6 mr-2 text-blue-500" />
          Water Quality Monitoring
        </h1>
        <p className="text-gray-500">
          Real-time water quality data and historical trends.
        </p>
      </div>
      
      <WaterQualityMonitor />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="glass w-full overflow-hidden card-transition hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <AlertTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" />
              Safety Assessment
            </CardTitle>
            <CardDescription>
              Quick summary of current water conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {waterQuality ? (
              <>
                <p>
                  The current water quality index is{" "}
                  <span className="font-semibold">{waterQuality.index}</span>.
                </p>
                <p>
                  Status:{" "}
                  <span className="font-semibold">{waterQuality.status}</span>.
                </p>
                <p>
                  Water is considered{" "}
                  <span className="font-semibold">
                    {waterQuality.safe ? "safe" : "unsafe"}
                  </span>{" "}
                  for consumption.
                </p>
                {!waterQuality.safe && (
                  <div className="mt-4 p-3 rounded-md bg-red-100 text-red-700">
                    <p className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span className="font-semibold">Alert:</span> Water may not
                      be safe for drinking.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p>Loading water quality data...</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass w-full overflow-hidden card-transition hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <BarChartIcon className="h-5 w-5 mr-2" />
              Historical Data
            </CardTitle>
            <CardDescription>
              Water quality trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="space-y-4">
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={historyData}>
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
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="table">
                <div className="max-h-[300px] overflow-y-auto mt-4">
                  <Table>
                    <TableCaption>Recent water quality readings</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Index</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Safe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.time}</TableCell>
                          <TableCell>{item.index}</TableCell>
                          <TableCell>{item.status}</TableCell>
                          <TableCell>
                            {item.safe ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 text-center">
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default WaterMonitoring;
