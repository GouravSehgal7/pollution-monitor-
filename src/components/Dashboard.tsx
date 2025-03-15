
import { useAQI } from "@/context/AQIContext";
import { getAQICategory, type AQICategory, AQI_CATEGORIES } from "@/utils/aqi-calculator";
import { evaluateWaterQuality } from "@/utils/aqi-calculator";
import AQIChart from "./AQIChart";
import Recommendations from "./Recommendations";
import AlertSettings from "./AlertSettings";
import TrafficMonitor from "./TrafficMonitor";
import WaterQualityMonitor from "./WaterQualityMonitor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Droplet, MapPin, Wind, RefreshCw, Clock } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { 
    currentAQI, 
    waterQuality, 
    loading, 
    error, 
    location, 
    personalizedRecommendations,
    refreshData
  } = useAQI();
  
  const aqiValue = currentAQI?.aqi ?? 0;
  const aqiCategory = getAQICategory(aqiValue);
  const categoryInfo = AQI_CATEGORIES[aqiCategory];
  
  const waterIndex = waterQuality?.index ?? 0;
  const waterEvaluation = evaluateWaterQuality(waterIndex);
  
  if (loading && !currentAQI) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw size={30} className="animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium">Loading air quality data...</h3>
          <p className="text-muted-foreground">Please wait while we fetch the latest information</p>
        </div>
      </div>
    );
  }
  
  if (error && !currentAQI) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle size={30} className="mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-medium">Unable to load data</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  const getAQIColor = (category: AQICategory) => {
    switch(category) {
      case 'good': return 'bg-aqi-good';
      case 'moderate': return 'bg-aqi-moderate';
      case 'unhealthy': return 'bg-aqi-unhealthy';
      case 'very-unhealthy': return 'bg-aqi-very-unhealthy';
      case 'hazardous': return 'bg-aqi-hazardous';
    }
  };
  
  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Location info */}
      {currentAQI?.city && (
        <motion.div 
          variants={childVariants} 
          className="mb-6 flex items-center text-muted-foreground"
        >
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">
            {currentAQI.city.name}
          </span>
          <Clock size={16} className="ml-4 mr-1" />
          <span className="text-sm">
            Updated {new Date(currentAQI.time.v * 1000).toLocaleTimeString()}
          </span>
          <button 
            onClick={() => refreshData()} 
            className="ml-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={14} />
          </button>
        </motion.div>
      )}
      
      {/* Main indicators */}
      <motion.div variants={childVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* AQI Card */}
        <Card className={`glass overflow-hidden card-transition hover:shadow-lg relative ${loading ? 'opacity-80' : ''}`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${getAQIColor(aqiCategory)}`}></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Air Quality Index
              {loading && <RefreshCw size={14} className="animate-spin ml-2" />}
            </CardTitle>
            <CardDescription>Current air quality level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="text-4xl font-bold tracking-tight">{aqiValue}</div>
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${getAQIColor(aqiCategory)} ${aqiCategory === 'good' || aqiCategory === 'moderate' ? 'text-black' : 'text-white'}`}>
                  {categoryInfo.label}
                </div>
              </div>
              <Progress 
                value={(aqiValue / 300) * 100} 
                indicatorClassName={getAQIColor(aqiCategory)}
                className="h-1.5"
              />
              <p className="text-sm text-muted-foreground mt-2">{categoryInfo.description}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Water Quality Card */}
        <Card className="glass overflow-hidden card-transition hover:shadow-lg relative">
          <div className={`absolute top-0 left-0 w-1 h-full ${waterEvaluation.safe ? 'bg-aqi-good' : 'bg-destructive'}`}></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Water Quality Index
              {loading && <RefreshCw size={14} className="animate-spin ml-2" />}
            </CardTitle>
            <CardDescription>Current water quality level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="text-4xl font-bold tracking-tight">{waterIndex}</div>
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${waterEvaluation.safe ? 'bg-aqi-good text-black' : 'bg-destructive text-white'}`}>
                  {waterEvaluation.status}
                </div>
              </div>
              <Progress 
                value={(waterIndex / 100) * 100}
                indicatorClassName={waterEvaluation.safe ? 'bg-aqi-good' : 'bg-destructive'}
                className="h-1.5"
              />
              <p className="text-sm text-muted-foreground mt-2">{waterEvaluation.description}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Weather info - condensed from AQI data */}
        <Card className="glass card-transition hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Weather Conditions</CardTitle>
            <CardDescription>Current conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentAQI?.iaqi && (
                <div className="space-y-2">
                  {currentAQI.iaqi.h && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-muted-foreground">
                        <Droplet size={16} className="mr-2" />
                        <span className="text-sm">Humidity</span>
                      </div>
                      <span className="font-medium">{currentAQI.iaqi.h.v}%</span>
                    </div>
                  )}
                  {currentAQI.iaqi.t && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
                        </svg>
                        <span className="text-sm">Temperature</span>
                      </div>
                      <span className="font-medium">{currentAQI.iaqi.t.v}°C</span>
                    </div>
                  )}
                  {currentAQI.iaqi.w && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-muted-foreground">
                        <Wind size={16} className="mr-2" />
                        <span className="text-sm">Wind</span>
                      </div>
                      <span className="font-medium">{currentAQI.iaqi.w.v} m/s</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Dominant pollutants */}
        <Card className="glass card-transition hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Dominant Pollutants</CardTitle>
            <CardDescription>Primary contaminants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentAQI?.iaqi && (
                <div className="space-y-2">
                  {currentAQI.iaqi.pm25 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-muted-foreground">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded mr-2">PM2.5</span>
                        <span className="text-sm">Fine particles</span>
                      </div>
                      <span className="font-medium">{currentAQI.iaqi.pm25.v} µg/m³</span>
                    </div>
                  )}
                  {currentAQI.iaqi.pm10 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-muted-foreground">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded mr-2">PM10</span>
                        <span className="text-sm">Coarse dust</span>
                      </div>
                      <span className="font-medium">{currentAQI.iaqi.pm10.v} µg/m³</span>
                    </div>
                  )}
                  {currentAQI.iaqi.o3 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-muted-foreground">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded mr-2">O₃</span>
                        <span className="text-sm">Ozone</span>
                      </div>
                      <span className="font-medium">{currentAQI.iaqi.o3.v} ppb</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Traffic and Water Monitoring */}
      <motion.div variants={childVariants} className="grid gap-6 md:grid-cols-2 mb-6">
        <TrafficMonitor />
        <WaterQualityMonitor />
      </motion.div>
      
      {/* Charts and Recommendations */}
      <motion.div variants={childVariants} className="grid gap-6 md:grid-cols-2 mb-6">
        <AQIChart />
        <Recommendations />
      </motion.div>
      
      {/* Settings - full width section */}
      <motion.div variants={childVariants}>
        <AlertSettings />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
