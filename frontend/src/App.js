// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [heading, setHeading] = useState(0);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let watchId;

    // === ১. কম্পাস (Device Orientation) ===
    const handleOrientation = (event) => {
      if (!event.alpha && event.webkitCompassHeading === undefined) return;

      let compassHeading = event.alpha || 0;

      // iOS Safari fix
      if (event.webkitCompassHeading !== undefined) {
        compassHeading = event.webkitCompassHeading;
      }

      // Android: orientation correction
      if (typeof window.orientation === 'number') {
        switch (window.orientation) {
          case 90: compassHeading -= 90; break;
          case -90: compassHeading += 90; break;
          case 180: compassHeading -= 180; break;
          default: break;
        }
      }

      // Normalize 0-360
      compassHeading = ((360 - compassHeading) % 360 + 360) % 360;
      setHeading(compassHeading);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      setError('কম্পাস সাপোর্ট করে না এই ডিভাইস');
    }

    // === ২. লোকেশন (Geolocation) ===
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          // Send to Django Backend
          axios.post('http://127.0.0.1:8000/api/readings/', {
            latitude,
            longitude,
            heading: parseFloat(heading.toFixed(2)),
          }).catch(err => {
            console.log("API Error:", err.response?.data || err.message);
          });
        },
        (err) => {
          setError(`লোকেশন: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    } else {
      setError('জিওলোকেশন সাপোর্ট করে না');
    }

    // === ৩. হিস্ট্রি ফেচ করা ===
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/readings/');
        setHistory(res.data);
      } catch (err) {
        console.log("History fetch error:", err);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);

    // === ক্লিনআপ ===
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (watchId) navigator.geolocation.clearWatch(watchId);
      clearInterval(interval);
    };
  }, [heading]);

  // দিকের নাম (N, NE, E, ...)
  const getDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  return (
    <div className="App">
      <h1>ডিজিটাল কম্পাস</h1>

      {error && <p className="error">{error}</p>}

      <div className="compass-container">
        <div className="compass" style={{ transform: `rotate(${heading}deg)` }}>
          <div className="arrow">N</div>
          <div className="center"></div>
        </div>

        <div className="info">
          <p>দিক: <strong>{heading.toFixed(1)}° ({getDirection(heading)})</strong></p>
          <p>লোকেশন: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
        </div>
      </div>

      <div className="history">
        <h3>হিস্ট্রি (সর্বশেষ ৫)</h3>
        {history.length === 0 ? (
          <p>এখনো কোনো ডাটা নেই</p>
        ) : (
          <ul>
            {history.slice(0, 5).map((item, i) => (
              <li key={i}>
                <strong>{item.heading.toFixed(1)}° ({getDirection(item.heading)})</strong>
                <br />
                <small>
                  {new Date(item.timestamp).toLocaleTimeString()} | 
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;