
import { useState, useEffect } from "react";
import { useAQI } from "@/context/AQIContext";
import { getAQICategory, AQI_CATEGORIES } from "@/utils/aqi-calculator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Header = () => {
  const { currentAQI, refreshData, loading } = useAQI();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const aqiValue = currentAQI?.aqi ?? 0;
  const aqiCategory = getAQICategory(aqiValue);
  const categoryInfo = AQI_CATEGORIES[aqiCategory];
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <header 
      className={`sticky top-0 z-50 glass transition-all duration-300 ${
        scrolled ? 'py-2 shadow-md' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-semibold text-primary animated-text animate-fade-in">
                ClearAir Monitor
              </h1>
              <p className="text-sm text-muted-foreground font-light animate-fade-up opacity-0" style={{ animationDelay: '200ms' }}>
                Real-time air and water quality monitoring
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-sm md:text-base font-medium animate-fade-in">
              {formatTime(time)}
            </div>
            <div className="text-xs text-muted-foreground animate-fade-up opacity-0" style={{ animationDelay: '300ms' }}>
              {formatDate(time)}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => refreshData()}
            disabled={loading}
            className="ml-2 rounded-full h-9 w-9 p-0 animate-fade-in"
          >
            <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
