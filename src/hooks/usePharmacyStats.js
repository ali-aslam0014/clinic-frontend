import { useState, useEffect } from 'react';
import axios from 'axios';

const usePharmacyStats = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockItems: 0,
    todaySales: 0,
    expiringSoon: 0,
    loading: true,
    error: null
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/pharmacy/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats({
        ...response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to fetch statistics'
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { ...stats, refetch: fetchStats };
};

export default usePharmacyStats; 