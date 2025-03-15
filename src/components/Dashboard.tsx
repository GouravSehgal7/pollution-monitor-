import AQIMap from "@/components/AQIMap";
import AQIMonitor from "@/components/AQIMonitor";
import WaterQualityMonitor from "@/components/WaterQualityMonitor";
import TrafficMonitor from "@/components/TrafficMonitor";
import AQIChart from "@/components/AQIChart";
import Recommendations from "@/components/Recommendations";
import AlertSettings from "@/components/AlertSettings";
import EnhancedAQIMonitor from "@/components/EnhancedAQIMonitor";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 dashboard">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        {/* <AQIMap /> */}
      </div>
      
      <div className="col-span-1">
        <AQIMonitor />
      </div>
      
      <div className="col-span-1">
        <WaterQualityMonitor />
      </div>
      
      <div className="col-span-1">
        <TrafficMonitor />
      </div>
      
      <div className="col-span-1 md:col-span-2">
        <AQIChart />
      </div>
      
      <div className="col-span-1">
        <EnhancedAQIMonitor />
      </div>
      
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <Recommendations />
      </div>
      
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <AlertSettings />
      </div>
    </div>
  );
};

export default Dashboard;
