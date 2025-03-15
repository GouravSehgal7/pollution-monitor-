import React, { useEffect, useState } from "react";
import { getCurrentuvquality } from "@/utils/api"; // ✅ Import function
import { FaSun, FaCloud, FaHeartbeat, FaRegSmile } from "react-icons/fa";
import Header from "@/components/Header";

interface UVData {
  found: boolean;
  datetime: string;
  index: {
    index_name: string;
    qualification: string;
    color: string;
    value: number;
    main_pollutants: string[];
  };
  pollutants: {
    uvi: {
      name: string;
      unit: string;
      value: number;
      confidence: number;
      index: {
        qualification: string;
        color: string;
        description: string;
        value: number;
      };
    };
  };
  health_recommendations: {
    all: string;
    family: string;
    sport: string;
    pregnancy: string;
    respiratory: string;
    elderly: string;
    cardiovascular: string;
  };
}

const Uv: React.FC = () => {
  const [uvData, setUvData] = useState<UVData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUVQuality = async () => {
      try {
        const response = await getCurrentuvquality();
        if (response?.data) {
          setUvData(response.data);
        }
      } catch (err) {
        console.error("Error fetching UV data:", err);
        setError("Failed to fetch UV data");
      } finally {
        setLoading(false);
      }
    };

    fetchUVQuality();
  }, []);

  if (loading)
    return <div className="text-center mt-10 text-lg font-semibold animate-pulse">Loading...</div>;

  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen w-full bg-gray-100">
        <Header/>
      <div className="w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">🌞 UV Quality Dashboard</h1>

        {/* UV Index Overview */}
        <div
          className="p-6 border-l-8 rounded-lg shadow-md mb-6"
          style={{ borderColor: uvData?.index.color }}
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FaSun className="text-yellow-500" /> Overall UV Index
          </h2>
          <p className="text-gray-700"><strong>Name:</strong> {uvData?.index.index_name}</p>
          <p className="text-gray-700"><strong>Qualification:</strong> {uvData?.index.qualification}</p>
          <p className="text-gray-700"><strong>Value:</strong> {uvData?.index.value}</p>
        </div>

        {/* UV Details */}
        <h2 className="text-xl font-semibold mt-4 mb-2 flex items-center gap-2">
          <FaCloud className="text-blue-500" /> UV Details
        </h2>
        <div className="p-6 border rounded-lg shadow-md bg-gray-50">
          <h3 className="font-semibold">{uvData?.pollutants.uvi.name} (UVI)</h3>
          <p><strong>Value:</strong> {uvData?.pollutants.uvi.value} {uvData?.pollutants.uvi.unit}</p>
          <p><strong>Confidence:</strong> {uvData?.pollutants.uvi.confidence}/5</p>
          <p><strong>Qualification:</strong> {uvData?.pollutants.uvi.index.qualification}</p>
          <p className="text-sm italic text-gray-600">{uvData?.pollutants.uvi.index.description}</p>
        </div>

        {/* Health Recommendations */}
        <h2 className="text-xl font-semibold mt-6 mb-2 flex items-center gap-2">
          <FaHeartbeat className="text-red-500" /> Health Recommendations
        </h2>
        <div className="p-6 border rounded-lg shadow-md bg-gray-50">
          {Object.entries(uvData?.health_recommendations || {}).map(([key, recommendation]) => (
            <p key={key} className="text-gray-800 flex items-center gap-2">
              <FaRegSmile className="text-green-500" />
              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {recommendation}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Uv;
