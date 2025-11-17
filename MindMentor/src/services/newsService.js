const NEWS_API_KEY = '1be2f64a700c43a589a390ee6e58b0cd';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Mental health related keywords for better filtering
const MENTAL_HEALTH_KEYWORDS = [
  'mental health',
  'depression',
  'anxiety',
  'therapy',
  'psychology',
  'wellness',
  'mindfulness',
  'meditation',
  'stress',
  'counseling',
  'psychiatrist',
  'psychologist',
  'mental illness',
  'bipolar',
  'PTSD',
  'trauma',
  'suicide prevention',
  'self-care',
  'emotional health',
  'cognitive behavioral therapy',
  'CBT',
  'mental wellness',
  'psychological health'
];

export const fetchMentalHealthNews = async (pageSize = 20) => {
  try {
    // Create multiple queries to get more diverse results
    const queries = [
      'mental health',
      'depression anxiety',
      'therapy counseling',
      'wellness mindfulness',
      'psychology psychiatrist'
    ];
    
    let allArticles = [];
    
    // Try different queries to get more articles
    for (const query of queries) {
      try {
        const response = await fetch(
          `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&apiKey=${NEWS_API_KEY}&pageSize=5&sortBy=publishedAt&language=en`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok' && data.articles) {
            allArticles = allArticles.concat(data.articles);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch news for query "${query}":`, error);
      }
    }
    
    // Remove duplicates based on URL
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    );
    
    // Filter and format the articles
    const filteredArticles = uniqueArticles
      .filter(article => {
        // More lenient filtering to ensure we get enough articles
        const title = article.title?.toLowerCase() || '';
        const description = article.description?.toLowerCase() || '';
        const content = article.content?.toLowerCase() || '';
        
        // Check if article contains any mental health related keywords
        const hasMentalHealthContent = MENTAL_HEALTH_KEYWORDS.some(keyword => 
          title.includes(keyword.toLowerCase()) || 
          description.includes(keyword.toLowerCase()) ||
          content.includes(keyword.toLowerCase())
        );
        
        // Also include general health articles if we don't have enough mental health specific ones
        const hasHealthContent = title.includes('health') || 
                                description.includes('health') || 
                                content.includes('health') ||
                                title.includes('wellness') ||
                                description.includes('wellness');
        
        return hasMentalHealthContent || hasHealthContent;
      })
      .slice(0, pageSize) // Take only the requested number
      .map(article => ({
        id: article.url || Math.random().toString(36).substr(2, 9),
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name || 'Unknown Source',
        author: article.author,
        // Create a preview/summary for the modal
        preview: article.description ? 
          article.description.substring(0, 200) + (article.description.length > 200 ? '...' : '') :
          'Click to read more about this mental health topic.'
      }));

    // If we still don't have enough articles, add some fallback content
    if (filteredArticles.length < 5) {
      const fallbackArticles = [
        {
          id: 'fallback-1',
          title: 'Understanding Mental Health: A Comprehensive Guide',
          description: 'Mental health is an essential part of our overall well-being. Learn about the importance of mental health awareness and how to maintain good mental health practices.',
          content: 'Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act. It also helps determine how we handle stress, relate to others, and make choices. Mental health is important at every stage of life, from childhood and adolescence through adulthood.',
          url: '#',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: 'MindMentor',
          author: 'Mental Health Team',
          preview: 'Mental health is an essential part of our overall well-being. Learn about the importance of mental health awareness...'
        },
        {
          id: 'fallback-2',
          title: 'Daily Practices for Better Mental Wellness',
          description: 'Simple daily practices that can significantly improve your mental wellness and overall quality of life.',
          content: 'Incorporating simple practices into your daily routine can have a profound impact on your mental wellness. These include mindfulness meditation, regular exercise, maintaining social connections, and practicing gratitude.',
          url: '#',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: 'MindMentor',
          author: 'Wellness Team',
          preview: 'Simple daily practices that can significantly improve your mental wellness and overall quality of life...'
        },
        {
          id: 'fallback-3',
          title: 'The Science of Stress Management',
          description: 'Understanding how stress affects your body and mind, and evidence-based techniques to manage it effectively.',
          content: 'Stress is a natural response to challenges, but chronic stress can have serious health implications. Learn about the physiological effects of stress and discover proven techniques like deep breathing, progressive muscle relaxation, and cognitive reframing.',
          url: '#',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: 'MindMentor',
          author: 'Health Research Team',
          preview: 'Understanding how stress affects your body and mind, and evidence-based techniques to manage it effectively...'
        },
        {
          id: 'fallback-4',
          title: 'Building Resilience: Your Mental Health Toolkit',
          description: 'Develop emotional resilience with practical strategies for bouncing back from life\'s challenges.',
          content: 'Resilience is the ability to adapt and recover from adversity. Building resilience involves developing coping strategies, maintaining positive relationships, setting realistic goals, and practicing self-care. These skills can be learned and strengthened over time.',
          url: '#',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: 'MindMentor',
          author: 'Psychology Team',
          preview: 'Develop emotional resilience with practical strategies for bouncing back from life\'s challenges...'
        },
        {
          id: 'fallback-5',
          title: 'Sleep and Mental Health: The Vital Connection',
          description: 'Explore the crucial relationship between quality sleep and mental well-being, plus tips for better rest.',
          content: 'Sleep plays a vital role in mental health. Poor sleep can contribute to anxiety, depression, and difficulty concentrating. Establishing good sleep hygiene, maintaining a consistent schedule, and creating a restful environment can significantly improve both sleep quality and mental well-being.',
          url: '#',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: 'MindMentor',
          author: 'Sleep Health Team',
          preview: 'Explore the crucial relationship between quality sleep and mental well-being, plus tips for better rest...'
        }
      ];
      
      // Add fallback articles to reach minimum of 5
      const neededFallbacks = 5 - filteredArticles.length;
      filteredArticles.push(...fallbackArticles.slice(0, neededFallbacks));
    }

    return {
      success: true,
      articles: filteredArticles,
      totalResults: filteredArticles.length
    };

  } catch (error) {
    console.error('Error fetching mental health news:', error);
    
    // Return fallback data in case of API failure
    return {
      success: false,
      articles: [],
      error: error.message,
      fallbackArticles: [
        {
          id: 'fallback-1',
          title: 'Understanding Mental Health: A Comprehensive Guide',
          description: 'Mental health is an essential part of our overall well-being. Learn about the importance of mental health awareness and how to maintain good mental health practices.',
          content: 'Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act. It also helps determine how we handle stress, relate to others, and make choices. Mental health is important at every stage of life, from childhood and adolescence through adulthood.',
          url: '#',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: 'MindMentor',
          author: 'Mental Health Team',
          preview: 'Mental health is an essential part of our overall well-being. Learn about the importance of mental health awareness...'
        },
        {
          id: 'fallback-2',
          title: 'Daily Practices for Better Mental Wellness',
          description: 'Simple daily practices that can significantly improve your mental wellness and overall quality of life.',
          content: 'Incorporating simple practices into your daily routine can have a profound impact on your mental wellness. These include mindfulness meditation, regular exercise, maintaining social connections, and practicing gratitude.',
          url: '#',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: 'MindMentor',
          author: 'Wellness Team',
          preview: 'Simple daily practices that can significantly improve your mental wellness and overall quality of life...'
        },
        {
          id: 'fallback-3',
          title: 'The Science of Stress Management',
          description: 'Understanding how stress affects your body and mind, and evidence-based techniques to manage it effectively.',
          content: 'Stress is a natural response to challenges, but chronic stress can have serious health implications. Learn about the physiological effects of stress and discover proven techniques like deep breathing, progressive muscle relaxation, and cognitive reframing.',
          url: '#',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: 'MindMentor',
          author: 'Health Research Team',
          preview: 'Understanding how stress affects your body and mind, and evidence-based techniques to manage it effectively...'
        },
        {
          id: 'fallback-4',
          title: 'Building Resilience: Your Mental Health Toolkit',
          description: 'Develop emotional resilience with practical strategies for bouncing back from life\'s challenges.',
          content: 'Resilience is the ability to adapt and recover from adversity. Building resilience involves developing coping strategies, maintaining positive relationships, setting realistic goals, and practicing self-care. These skills can be learned and strengthened over time.',
          url: '#',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: 'MindMentor',
          author: 'Psychology Team',
          preview: 'Develop emotional resilience with practical strategies for bouncing back from life\'s challenges...'
        },
        {
          id: 'fallback-5',
          title: 'Sleep and Mental Health: The Vital Connection',
          description: 'Explore the crucial relationship between quality sleep and mental well-being, plus tips for better rest.',
          content: 'Sleep plays a vital role in mental health. Poor sleep can contribute to anxiety, depression, and difficulty concentrating. Establishing good sleep hygiene, maintaining a consistent schedule, and creating a restful environment can significantly improve both sleep quality and mental well-being.',
          url: '#',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: 'MindMentor',
          author: 'Sleep Health Team',
          preview: 'Explore the crucial relationship between quality sleep and mental well-being, plus tips for better rest...'
        }
      ]
    };
  }
};

export const fetchTopMentalHealthNews = async () => {
  try {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?category=health&apiKey=${NEWS_API_KEY}&pageSize=5&country=us`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(`News API returned error: ${data.message || 'Unknown error'}`);
    }

    // Filter for mental health related headlines
    const mentalHealthArticles = data.articles.filter(article => {
      const title = article.title?.toLowerCase() || '';
      const description = article.description?.toLowerCase() || '';
      
      return MENTAL_HEALTH_KEYWORDS.some(keyword => 
        title.includes(keyword.toLowerCase()) || 
        description.includes(keyword.toLowerCase())
      );
    });

    return {
      success: true,
      articles: mentalHealthArticles.map(article => ({
        id: article.url || Math.random().toString(36).substr(2, 9),
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name || 'Unknown Source',
        author: article.author,
        preview: article.description ? 
          article.description.substring(0, 150) + (article.description.length > 150 ? '...' : '') :
          'Click to read more about this mental health topic.'
      }))
    };

  } catch (error) {
    console.error('Error fetching top mental health news:', error);
    return {
      success: false,
      articles: [],
      error: error.message
    };
  }
};

// Utility function to format date
export const formatNewsDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch (error) {
    return 'Recently';
  }
};
