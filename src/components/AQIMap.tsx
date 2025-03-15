
import { useAQI } from "@/context/AQIContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, AlertCircle } from "lucide-react";

const AQIMap = () => {
  const { location, error } = useAQI();
  
  const mapUrl = location 
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBIwzALxUPNbatRBj3Xi1Uhp0fFzwWNBkE&q=${location.lat},${location.lng}&zoom=12`
    : null;
  
  return (
    <Card className="glass w-full overflow-hidden card-transition hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Map size={18} className="mr-2" />
          AQI Map
        </CardTitle>
        <CardDescription>
          Air quality in your area
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 h-[300px] overflow-hidden">
        {mapUrl ? (
          <iframe
            title="Air Quality Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={mapUrl}
          ></iframe>
        ) : (
          <div className="h-full flex items-center justify-center flex-col p-4">
            <AlertCircle size={24} className="mb-2 text-muted-foreground" />
            <p className="text-muted-foreground text-center text-sm">
              {error ? error : "Location access is required to display the map."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AQIMap;
