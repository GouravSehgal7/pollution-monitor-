
import { useState } from "react";
import { useAQI } from "@/context/AQIContext";
import { UserProfile } from "@/utils/ml-prediction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Bell, User, Clock, AlertCircle } from "lucide-react";

const AlertSettings = () => {
  const { userProfile, updateUserProfile } = useAQI();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [threshold, setThreshold] = useState(100);
  const [enableSMS, setEnableSMS] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // For the time selection
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  const toggleTimeSlot = (hour: number) => {
    const currentHours = [...userProfile.typicalOutdoorHours];
    const index = currentHours.indexOf(hour);
    
    if (index >= 0) {
      currentHours.splice(index, 1);
    } else {
      currentHours.push(hour);
    }
    
    updateUserProfile({ typicalOutdoorHours: currentHours });
  };
  
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };
  
  const handleSaveNotifications = () => {
    // In a real app, we would save this to a backend or service worker
    toast.success("Notification settings saved", {
      description: `You'll receive alerts when AQI exceeds ${threshold}`,
      action: {
        label: "Undo",
        onClick: () => setNotificationsEnabled(false)
      }
    });
    
    if (!("Notification" in window)) {
      toast.error("Notifications not supported", {
        description: "Your browser doesn't support notifications"
      });
      return;
    }
    
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("ClearAir Alerts", {
            body: "You will now receive air quality alerts"
          });
        }
      });
    }
  };
  
  const handleActivityLevelChange = (level: UserProfile['activityLevel']) => {
    updateUserProfile({ activityLevel: level });
    
    toast("Profile updated", {
      description: `Activity level set to ${level}`,
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    });
  };
  
  const handleSensitivitiesChange = (value: boolean) => {
    updateUserProfile({ hasSensitivities: value });
    
    toast("Profile updated", {
      description: value 
        ? "Health sensitivities added to your profile" 
        : "Health sensitivities removed from your profile",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    });
  };
  
  return (
    <Card className="glass card-transition hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          Personalization & Alerts
        </CardTitle>
        <CardDescription>
          Customize your settings and alert preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile" className="flex items-center">
              <User size={16} className="mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center">
              <Bell size={16} className="mr-2" />
              Alert Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Health Profile</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label htmlFor="sensitivity" className="font-medium">
                      Do you have health sensitivities?
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Such as asthma, allergies, respiratory or cardiovascular conditions
                    </p>
                  </div>
                  <Switch 
                    id="sensitivity" 
                    checked={userProfile.hasSensitivities}
                    onCheckedChange={handleSensitivitiesChange}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Activity Level</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  What is your typical outdoor activity level?
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    variant={userProfile.activityLevel === 'low' ? 'default' : 'outline'}
                    onClick={() => handleActivityLevelChange('low')}
                    className="transition-all"
                  >
                    Low
                  </Button>
                  <Button 
                    variant={userProfile.activityLevel === 'moderate' ? 'default' : 'outline'}
                    onClick={() => handleActivityLevelChange('moderate')}
                    className="transition-all"
                  >
                    Moderate
                  </Button>
                  <Button 
                    variant={userProfile.activityLevel === 'high' ? 'default' : 'outline'}
                    onClick={() => handleActivityLevelChange('high')}
                    className="transition-all"
                  >
                    High
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-3">
                  <Clock size={18} className="mr-2" />
                  <h3 className="text-lg font-medium">Typical Outdoor Hours</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Select hours when you're typically outdoors
                </p>
                
                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                  {timeSlots.map(hour => (
                    <button
                      key={hour}
                      onClick={() => toggleTimeSlot(hour)}
                      className={`
                        px-2 py-1 text-xs rounded-md transition-all
                        ${userProfile.typicalOutdoorHours.includes(hour) 
                          ? 'bg-primary text-white' 
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
                      `}
                    >
                      {formatHour(hour)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="font-medium">
                    Enable Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get alerts when air quality changes significantly
                  </p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              {notificationsEnabled && (
                <>
                  <div className="space-y-3">
                    <Label className="font-medium">AQI Alert Threshold</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert me when AQI exceeds: <span className="font-medium">{threshold}</span>
                    </p>
                    <Slider 
                      defaultValue={[100]} 
                      max={300} 
                      step={1} 
                      value={[threshold]}
                      onValueChange={(value) => setThreshold(value[0])}
                      className="my-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Good</span>
                      <span>Moderate</span>
                      <span>Unhealthy</span>
                      <span>Hazardous</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Label htmlFor="sms" className="font-medium">
                          SMS Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Also receive alerts via text message
                        </p>
                      </div>
                      <Switch 
                        id="sms" 
                        checked={enableSMS}
                        onCheckedChange={setEnableSMS}
                      />
                    </div>
                    
                    {enableSMS && (
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 flex flex-col space-y-2">
                    <Button onClick={handleSaveNotifications}>
                      Save Notification Settings
                    </Button>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <AlertCircle size={14} className="mr-1" />
                      Notifications require browser permission
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AlertSettings;
