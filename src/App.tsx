
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AQIProvider } from "./context/AQIContext";
import { LazyMotion, domAnimation } from "framer-motion";
import Index from "./pages/Index";
import WaterMonitoring from "./pages/WaterMonitoring";
import TrafficMonitoring from "./pages/TrafficMonitoring";
import NotFound from "./pages/NotFound";
import Uv from "./pages/uv";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LazyMotion features={domAnimation}>
      <TooltipProvider>
        <AQIProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/water" element={<WaterMonitoring />} />
              <Route path="/traffic" element={<TrafficMonitoring />} />
              <Route path="/uv" element={<Uv />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AQIProvider>
      </TooltipProvider>
    </LazyMotion>
  </QueryClientProvider>
);

export default App;
