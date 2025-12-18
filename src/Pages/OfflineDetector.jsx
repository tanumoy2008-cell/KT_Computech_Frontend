import { useEffect, useState } from 'react';
import axios from '../config/axios';

const OfflineDetector = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnlineStatus = async () => {
      try {
        await axios.head('/api/health');
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      } finally {
        setIsLoading(false);
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      checkOnlineStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsLoading(false);
    };

    // Initial check
    checkOnlineStatus();

    // Add event listeners for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up interval to check connection periodically
    const intervalId = setInterval(checkOnlineStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-6">📡</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">You're Offline</h1>
          <p className="text-gray-600 mb-8">
            Looks like you've lost your internet connection. Please check your network settings and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#006045] hover:bg-[#004d38] text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default OfflineDetector;