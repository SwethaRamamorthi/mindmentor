import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, User, Newspaper, Loader2, AlertCircle } from 'lucide-react';
import { fetchMentalHealthNews, formatNewsDate } from '../services/newsService';

const NewsModal = ({ isOpen, onClose }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  useEffect(() => {
    if (isOpen) {
      loadNews();
    }
  }, [isOpen]);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchMentalHealthNews(15);
      
      if (result.success) {
        setArticles(result.articles);
        // Ensure we have at least 5 articles
        if (result.articles.length < 5) {
          console.warn('Only received', result.articles.length, 'articles, using fallbacks to reach minimum of 5');
        }
      } else {
        // Use fallback articles if API fails
        setArticles(result.fallbackArticles || []);
        setError('Using offline content. Some features may be limited.');
      }
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openArticleInNewTab = (url) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Newspaper className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Mental Health News</h2>
                <p className="text-sm text-gray-600">Stay informed about mental wellness</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading mental health news...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">{error}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadNews}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Try Again
                  </motion.button>
                </div>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Newspaper className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No articles found at the moment.</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    {/* Article Header */}
                    <div className="flex items-start gap-4">
                      {article.urlToImage && (
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        {/* Article Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatNewsDate(article.publishedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {article.source}
                          </div>
                        </div>

                        {/* Article Preview */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {article.preview}
                        </p>

                         {/* Article Actions */}
                         <div className="flex items-center gap-3">
                           {article.url && article.url !== '#' && (
                             <motion.button
                               whileHover={{ scale: 1.05 }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => openArticleInNewTab(article.url)}
                               className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                             >
                               <ExternalLink className="w-4 h-4" />
                               Read Full Article
                             </motion.button>
                           )}
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>Powered by NewsAPI • Mental Health Focus</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadNews}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Refresh News
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewsModal;
