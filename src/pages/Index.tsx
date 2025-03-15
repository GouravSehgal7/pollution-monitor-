
import { useEffect } from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  // Set document title
  useEffect(() => {
    document.title = "ClearAir Monitor | Real-time Air Quality";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
