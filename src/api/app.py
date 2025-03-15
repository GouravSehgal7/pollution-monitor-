from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import random
import time
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Simulated traffic data
traffic_data = {
    "vehicles_per_hour": 350,
    "congestion_level": "moderate",
    "last_updated": datetime.now().isoformat(),
    "pollution_factor": 1.2
}

# Simulated water quality data
water_data = {
    "index": 35,
    "parameters": {
        "ph": 7.2,
        "turbidity": 1.8,
        "dissolved_oxygen": 8.5,
        "conductivity": 450,
        "nitrates": 2.1,
        "e_coli": 5.2
    },
    "last_updated": datetime.now().isoformat(),
    "status": "good",
    "safe": True
}

# Historical data storage
aqi_history = []
traffic_history = []
water_history = []

# Generate initial historical data
for i in range(24):
    timestamp = (datetime.now() - timedelta(hours=24-i)).isoformat()
    
    aqi_history.append({
        "timestamp": timestamp,
        "value": random.randint(20, 150),
        "dominant_pollutant": random.choice(["PM2.5", "PM10", "O3", "NO2"])
    })
    
    traffic_history.append({
        "timestamp": timestamp,
        "vehicles_per_hour": random.randint(100, 800),
        "congestion_level": random.choice(["low", "moderate", "high"]),
        "pollution_factor": round(random.uniform(0.8, 2.5), 1)
    })
    
    water_history.append({
        "timestamp": timestamp,
        "index": random.randint(10, 90),
        "status": random.choice(["excellent", "good", "fair", "poor"]),
        "safe": random.choice([True, True, True, False])
    })

@app.route('/api/traffic/current', methods=['GET'])
def get_traffic():
    # Simulate fluctuations in traffic data
    traffic_data["vehicles_per_hour"] = random.randint(200, 1000)
    traffic_data["congestion_level"] = random.choice(["low", "moderate", "high", "severe"])
    traffic_data["last_updated"] = datetime.now().isoformat()
    traffic_data["pollution_factor"] = round(random.uniform(0.8, 3.0), 1)
    
    # Update history
    traffic_history.append({
        "timestamp": traffic_data["last_updated"],
        "vehicles_per_hour": traffic_data["vehicles_per_hour"],
        "congestion_level": traffic_data["congestion_level"],
        "pollution_factor": traffic_data["pollution_factor"]
    })
    
    if len(traffic_history) > 144:  # Keep last 6 days of hourly data
        traffic_history.pop(0)
    
    return jsonify(traffic_data)

@app.route('/api/traffic/history', methods=['GET'])
def get_traffic_history():
    return jsonify(traffic_history)

@app.route('/api/water/current', methods=['GET'])
def get_water():
    # Simulate changes in water quality
    water_data["index"] = random.randint(10, 100)
    water_data["parameters"]["ph"] = round(random.uniform(6.5, 8.5), 1)
    water_data["parameters"]["turbidity"] = round(random.uniform(0.5, 5.0), 1)
    water_data["parameters"]["dissolved_oxygen"] = round(random.uniform(6.0, 10.0), 1)
    water_data["parameters"]["conductivity"] = random.randint(300, 600)
    water_data["parameters"]["nitrates"] = round(random.uniform(0.5, 10.0), 1)
    water_data["parameters"]["e_coli"] = round(random.uniform(1.0, 20.0), 1)
    water_data["last_updated"] = datetime.now().isoformat()
    
    # Determine safety status
    if water_data["index"] <= 25:
        water_data["status"] = "excellent"
        water_data["safe"] = True
    elif water_data["index"] <= 50:
        water_data["status"] = "good"
        water_data["safe"] = True
    elif water_data["index"] <= 75:
        water_data["status"] = "fair"
        water_data["safe"] = True
    else:
        water_data["status"] = "poor"
        water_data["safe"] = False
    
    # Update history
    water_history.append({
        "timestamp": water_data["last_updated"],
        "index": water_data["index"],
        "status": water_data["status"],
        "safe": water_data["safe"]
    })
    
    if len(water_history) > 144:  # Keep last 6 days of hourly data
        water_history.pop(0)
    
    return jsonify(water_data)

@app.route('/api/water/history', methods=['GET'])
def get_water_history():
    return jsonify(water_history)

@app.route('/api/aqi/enhance', methods=['POST'])
def enhance_aqi_prediction():
    data = request.json
    base_aqi = data.get('base_aqi', 50)
    location = data.get('location', {'lat': 0, 'lng': 0})
    
    # Enhanced model with Meersens-like factors
    # Traffic factors - simulating real-world traffic impacts
    time_of_day = datetime.now().hour
    is_rush_hour = 7 <= time_of_day <= 9 or 16 <= time_of_day <= 19
    is_weekend = datetime.now().weekday() >= 5
    
    # Traffic factor calculation (higher during rush hours, lower on weekends)
    base_traffic_factor = random.uniform(0.8, 1.5)
    if is_rush_hour:
        traffic_factor = base_traffic_factor * random.uniform(1.2, 1.5)
    elif is_weekend:
        traffic_factor = base_traffic_factor * random.uniform(0.6, 0.9)
    else:
        traffic_factor = base_traffic_factor
    
    # Weather factors (humidity, temperature, wind speed)
    weather_factor = random.uniform(0.9, 1.2)
    
    # Time factors (diurnal patterns)
    if 7 <= time_of_day <= 9:  # Morning rush
        time_factor = 1.3
    elif 16 <= time_of_day <= 19:  # Evening rush
        time_factor = 1.2
    elif 22 <= time_of_day or time_of_day <= 5:  # Night
        time_factor = 0.8
    else:  # Other times
        time_factor = 1.0
    
    # Industrial proximity simulation (higher near industrial areas)
    # In a real app, this would use location data to determine proximity
    industrial_factor = random.uniform(1.0, 1.3)
    
    # Calculate enhanced AQI
    enhanced_aqi = round(base_aqi * traffic_factor * weather_factor * time_factor * industrial_factor)
    
    # Ensure enhanced AQI is within realistic bounds
    enhanced_aqi = min(enhanced_aqi, 500)  # AQI shouldn't exceed 500
    
    response = {
        "original_aqi": base_aqi,
        "enhanced_aqi": enhanced_aqi,
        "factors": {
            "traffic": round(traffic_factor, 2),
            "weather": round(weather_factor, 2),
            "time_of_day": round(time_factor, 2),
            "industrial": round(industrial_factor, 2)
        },
        "timestamp": datetime.now().isoformat()
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
