# FoodTechMap - Complete Platform Guide

## 🚀 Quick Start

### 1. Setup & Launch
```bash
# Start local server
python server.py

# Open in Firefox
http://localhost:8000/login.html
```

### 2. ESP32 Hardware Setup (Optional)
- Wire DHT22 sensors to ESP32 (pins 4 & 5)
- Upload `esp32_dht22_sensors.ino`
- Update IP address in JavaScript files

## 📱 Platform Features

### 🔐 Authentication System
- **Login/Register**: Role-based access (Consumer, Supplier, Emergency, Admin)
- **Emergency Access**: Direct crisis mode without login
- **Session Management**: Persistent login with localStorage

### 👤 Consumer Dashboard (`consumer.html`)
- **Interactive Map**: Find nearby food centers
- **Real-time Status**: Center availability and supplies
- **Search & Filter**: Find specific food types
- **Directions**: GPS navigation to centers
- **Issue Reporting**: Report problems or feedback

### 🏪 Supplier Dashboard (`supplier.html`)
- **Inventory Management**: Add/update stock levels
- **Consumer Requests**: Respond to food requests
- **Low Stock Alerts**: Automatic notifications
- **Statistics**: Daily served, efficiency metrics
- **Real-time Updates**: Live inventory tracking

### 🚨 Emergency Dashboard (`emergency-dashboard.html`)
- **Crisis Management**: Emergency food distribution
- **Verified Distribution Points**: Real-time mapping
- **Supply Tracking**: Capacity and availability
- **Emergency Reporting**: Crisis alerts and requests
- **Real-time Coordination**: Live updates during emergencies

### 🔧 IoT Monitoring (`iot-monitoring.html`)
- **Sensor Data**: Temperature, humidity, air quality, vibration
- **ESP32 Integration**: Real DHT22 sensor data
- **Vehicle Tracking**: Transportation fleet monitoring
- **Storage Facilities**: Warehouse condition monitoring
- **Alert System**: Threshold violations and equipment issues

## 🛠 Technical Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Modern web standards
- **Progressive Web App**: Installable, offline support
- **Google Maps API**: Interactive mapping
- **Chart.js**: Real-time data visualization
- **Material Icons**: Consistent UI design

### IoT Integration
- **ESP32**: WiFi-enabled microcontroller
- **DHT22 Sensors**: Temperature/humidity monitoring
- **JSON API**: RESTful sensor data endpoints
- **WebSocket**: Real-time data streaming
- **CORS Support**: Cross-origin requests

### PWA Features
- **Service Worker**: Offline functionality
- **App Manifest**: Native app experience
- **Push Notifications**: Alert system
- **Local Storage**: Data persistence
- **Responsive Design**: Mobile-first approach

## 🔄 User Workflows

### Consumer Journey
1. **Login** → Consumer Dashboard
2. **Find Centers** → Interactive map with real-time data
3. **Check Availability** → Live stock levels and hours
4. **Get Directions** → GPS navigation
5. **Provide Feedback** → Rate and review centers

### Supplier Journey
1. **Login** → Supplier Dashboard
2. **Manage Inventory** → Add/update stock levels
3. **Monitor Requests** → Consumer food requests
4. **Track Alerts** → Low stock notifications
5. **Analyze Performance** → Efficiency metrics

### Emergency Coordinator Journey
1. **Emergency Access** → Crisis dashboard
2. **Monitor Distribution** → Real-time center status
3. **Coordinate Response** → Emergency alerts and routing
4. **Track Supplies** → Capacity and availability
5. **Manage Crisis** → Real-time coordination

### Admin Journey
1. **Login** → IoT Monitoring Dashboard
2. **Monitor Sensors** → Real-time environmental data
3. **Track Vehicles** → Transportation fleet status
4. **Manage Facilities** → Storage condition monitoring
5. **Handle Alerts** → System notifications and issues

## 📊 Data Integration

### Real Sensor Data (ESP32)
- Temperature: 2-6°C optimal range
- Humidity: 45-65% optimal range
- Real-time charts and alerts
- Automatic threshold monitoring

### Mock Data (Demo Mode)
- Simulated sensor readings
- Random variations for testing
- Fallback when ESP32 unavailable

## 🔧 Configuration

### WiFi Setup (ESP32)
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

### API Endpoints
```javascript
let esp32IP = '192.168.1.100'; // Update with ESP32 IP
```

### Google Maps API
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
```

## 🚀 Deployment

### Local Development
1. Run `python server.py`
2. Access via `http://localhost:8000`
3. Test all features and ESP32 integration

### Production Deployment
1. Upload files to web server
2. Configure HTTPS for PWA features
3. Update API endpoints for production
4. Set up real database integration

## 🔒 Security Features

- **Authentication**: Role-based access control
- **Session Management**: Secure token storage
- **Input Validation**: Form data sanitization
- **CORS Protection**: Cross-origin request handling
- **Emergency Access**: Crisis mode bypass

## 📱 Mobile Features

- **Responsive Design**: Works on all devices
- **PWA Installation**: Add to home screen
- **Offline Support**: Core features work offline
- **GPS Integration**: Location-based services
- **Touch Optimized**: Mobile-first interface

The platform is now complete with full authentication, role-based dashboards, ESP32 IoT integration, and PWA capabilities for emergency food distribution and monitoring.