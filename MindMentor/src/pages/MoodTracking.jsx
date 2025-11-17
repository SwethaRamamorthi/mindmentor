import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, TrendingUp, BarChart3, PieChart, Activity, LogOut } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  onAuthStateChange, 
  getMoodHistory, 
  listenToMoodHistory,
  signOutUser 
} from '../services/firebaseService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MoodTracking = () => {
  const [user, setUser] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7'); // 7, 30, 90 days
  const navigate = useNavigate();

  const moodColors = {
    happy: '#10B981', // green-500 - fresh and positive
    sad: '#3B82F6',   // blue-500 - calm and soothing
    angry: '#EF4444', // red-500 - intense and strong
    tired: '#F59E0B'   // amber-500 - warm and restful
  };

  const moodEmojis = {
    happy: '😊',
    sad: '😔',
    angry: '😡',
    tired: '😴'
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user);
        loadMoodHistory(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadMoodHistory = (userId) => {
    setLoading(true);
    const unsubscribe = listenToMoodHistory(userId, (moods) => {
      setMoodHistory(moods);
      setLoading(false);
    });
    return unsubscribe;
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  // Filter mood history based on selected period
  const getFilteredMoodHistory = () => {
    const days = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return moodHistory.filter(mood => {
      const moodDate = new Date(mood.createdAt);
      return moodDate >= cutoffDate;
    });
  };

  // Prepare data for charts
  const prepareChartData = () => {
    const filteredHistory = getFilteredMoodHistory();
    
    // Group by date
    const moodByDate = {};
    filteredHistory.forEach(mood => {
      const date = new Date(mood.createdAt).toLocaleDateString();
      if (!moodByDate[date]) {
        moodByDate[date] = {};
      }
      moodByDate[date][mood.mood] = (moodByDate[date][mood.mood] || 0) + 1;
    });

    const dates = Object.keys(moodByDate).sort();
    const moods = ['happy', 'sad', 'angry', 'tired'];

    // Line and Bar chart data - using darker, more visible colors
    const datasets = moods.map(mood => ({
      label: mood.charAt(0).toUpperCase() + mood.slice(1),
      data: dates.map(date => moodByDate[date]?.[mood] || 0),
      borderColor: moodColors[mood],
      backgroundColor: moodColors[mood] + '80', // Darker with 80% opacity for strong visibility
      borderWidth: 3,
      tension: 0.4,
      fill: true
    }));

    // Doughnut chart data
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood] = filteredHistory.filter(m => m.mood === mood).length;
      return acc;
    }, {});

    return {
      lineBarData: {
        labels: dates,
        datasets: datasets
      },
      doughnutData: {
        labels: moods.map(mood => mood.charAt(0).toUpperCase() + mood.slice(1)),
        datasets: [{
          data: Object.values(moodCounts),
          backgroundColor: Object.values(moodColors), // Full opacity for darker, vibrant colors
          borderColor: '#FFFFFF', // White borders for contrast
          borderWidth: 3,
          hoverOffset: 8
        }]
      }
    };
  };

  const chartData = prepareChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#0f172a', // slate-900 - darker text for better contrast
          font: {
            size: 13,
            weight: '600'
          },
          padding: 15
        }
      },
      title: {
        display: true,
        text: `Mood Tracking - Last ${selectedPeriod} Days`,
        color: '#1e293b', // slate-800 - darker text
        font: {
          size: 18,
          weight: '700'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#475569', // slate-600 - darker text for better visibility
          font: {
            size: 12,
            weight: '500'
          }
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.3)', // slate-500 with higher opacity for darker grid
          drawBorder: true,
          borderColor: '#334155'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#475569', // slate-600 - darker text for better visibility
          font: {
            size: 12,
            weight: '500'
          },
          stepSize: 1
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.3)', // slate-500 with higher opacity for darker grid
          drawBorder: true,
          borderColor: '#334155'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#0f172a', // slate-900 - darker text for better contrast
          font: {
            size: 13,
            weight: '600'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: `Mood Distribution - Last ${selectedPeriod} Days`,
        color: '#1e293b', // slate-800 - darker text
        font: {
          size: 18,
          weight: '700'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12
      }
    }
  };

  // Calculate mood statistics
  const getMoodStats = () => {
    const filteredHistory = getFilteredMoodHistory();
    const totalEntries = filteredHistory.length;
    
    if (totalEntries === 0) {
      return {
        totalEntries: 0,
        mostCommonMood: null,
        averageMoodPerDay: 0,
        moodDistribution: {}
      };
    }

    const moodCounts = filteredHistory.reduce((acc, mood) => {
      acc[mood.mood] = (acc[mood.mood] || 0) + 1;
      return acc;
    }, {});

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    const uniqueDays = new Set(filteredHistory.map(mood => 
      new Date(mood.createdAt).toLocaleDateString()
    )).size;

    return {
      totalEntries,
      mostCommonMood,
      averageMoodPerDay: (totalEntries / uniqueDays).toFixed(1),
      moodDistribution: moodCounts
    };
  };

  const stats = getMoodStats();

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading mood data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-3 md:p-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToHome}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">
              Mood Tracking 📊
            </h1>
            <p className="text-slate-600 text-xs md:text-sm">
              Track your emotional journey
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors flex-shrink-0 ml-2"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
        </motion.button>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect p-4 mb-6 rounded-xl"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            {/* View All Charts */}
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              <span className="text-sm text-slate-600">All charts displayed</span>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="glass-effect p-4 rounded-xl text-center">
            <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-800">{stats.totalEntries}</div>
            <div className="text-sm text-slate-600">Total Entries</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <div className="text-3xl mb-2">
              {stats.mostCommonMood ? moodEmojis[stats.mostCommonMood] : '📊'}
            </div>
            <div className="text-sm font-medium text-slate-800">
              {stats.mostCommonMood ? stats.mostCommonMood.charAt(0).toUpperCase() + stats.mostCommonMood.slice(1) : 'No Data'}
            </div>
            <div className="text-xs text-slate-600">Most Common</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-slate-800">{stats.averageMoodPerDay}</div>
            <div className="text-sm text-slate-600">Avg per Day</div>
          </div>
          
          <div className="glass-effect p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-slate-800">{selectedPeriod}</div>
            <div className="text-sm text-slate-600">Days Tracked</div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect p-6 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-slate-800">Mood Trends</h3>
            </div>
            <div className="h-80">
              <Line data={chartData.lineBarData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-effect p-6 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-slate-800">Mood Comparison</h3>
            </div>
            <div className="h-80">
              <Bar data={chartData.lineBarData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-effect p-6 rounded-xl mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-slate-800">Mood Distribution</h3>
          </div>
          <div className="h-80 flex items-center justify-center">
            <div className="w-80 h-80">
              <Doughnut data={chartData.doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </motion.div>

        {/* Recent Mood Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Mood Entries</h3>
          {getFilteredMoodHistory().length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <div className="text-4xl mb-2">📊</div>
              <p>No mood entries found for the selected period.</p>
              <p className="text-sm mt-2">Start tracking your mood in the chat!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredMoodHistory().slice(0, 10).map((mood, index) => (
                <motion.div
                  key={mood.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{moodEmojis[mood.mood]}</div>
                    <div>
                      <div className="font-medium text-slate-800 capitalize">
                        {mood.mood}
                      </div>
                      <div className="text-sm text-slate-600">
                        {new Date(mood.createdAt).toLocaleDateString()} at{' '}
                        {new Date(mood.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  {mood.note && (
                    <div className="text-sm text-slate-600 max-w-xs truncate">
                      "{mood.note}"
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MoodTracking;
