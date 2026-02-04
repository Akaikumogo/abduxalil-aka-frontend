import axios from 'axios';

// API Configuration: .env (VITE_API_URL) yo'q bo'lsa productionda https://aa.akaikumogo.uz dan oladi
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const FALLBACK_API_ORIGIN = "https://aa.akaikumogo.uz";
const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : isLocalHost
    ? "http://localhost:5001/api"
    : `${FALLBACK_API_ORIGIN}/api`;
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : isLocalHost
    ? "http://localhost:5001"
    : FALLBACK_API_ORIGIN;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get full image URL (uploads har doim backend domain bilan)
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const uploadsPath = path.startsWith('/') ? path : `/${path}`;
  if (uploadsPath.startsWith('/uploads')) {
    const base = API_BASE || FALLBACK_API_ORIGIN;
    return `${base}${uploadsPath}`;
  }
  return path;
};

// ==================== PUBLIC API ====================

// Hero Settings
export const heroApi = {
  getSettings: async () => {
    try {
      // Get both images - first Uzbek, then English
      const [uzResponse, enResponse] = await Promise.all([
        api.get('/hero/image', { params: { language: 'uz' } }),
        api.get('/hero/image', { params: { language: 'en' } }),
      ]);
      return {
        imageUz: uzResponse.data.data?.imageUrl || null,
        imageEn: enResponse.data.data?.imageUrl || null,
      };
    } catch (error) {
      return { imageUz: null, imageEn: null };
    }
  },
};

// Statistics
export const statsApi = {
  getAll: async () => {
    try {
      const response = await api.get('/stats');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },
};

// Features (Why Us)
export const featuresApi = {
  getAll: async () => {
    try {
      const response = await api.get('/features');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },
};

// Programs
export const programsApi = {
  getAll: async () => {
    try {
      const response = await api.get('/programs');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },
};

// Countries
export const countriesApi = {
  getAll: async () => {
    try {
      const response = await api.get('/countries');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },
};

// Steps (How it works)
export const stepsApi = {
  getAll: async () => {
    try {
      const response = await api.get('/steps');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },
};

// Video Settings
export const videoApi = {
  get: async () => {
    try {
      const response = await api.get('/video');
      return response.data.data;
    } catch (error) {
      return null;
    }
  },
};

// Testimonials
export const testimonialsApi = {
  getAll: async () => {
    try {
      const response = await api.get('/testimonials');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },
};

// Video Tips
export const tipsApi = {
  getAll: async () => {
    try {
      const response = await api.get('/tips');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },
};

// FAQ
export const faqApi = {
  getSettings: async () => {
    try {
      const response = await api.get('/faq/settings');
      return response.data.data;
    } catch (error) {
      return null;
    }
  },
  getAll: async () => {
    try {
      const response = await api.get('/faq');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },
};

// About Settings
export const aboutApi = {
  get: async () => {
    try {
      const response = await api.get('/about');
      return response.data.data;
    } catch (error) {
      return null;
    }
  },
};

// Contact Settings
export const contactApi = {
  get: async () => {
    try {
      const response = await api.get('/contact');
      return response.data.data;
    } catch (error) {
      return null;
    }
  },
};

// Applications (Form submissions)
export const applicationsApi = {
  submit: async (data) => {
    try {
      const response = await api.post('/applications', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Chat/Telegram API
export const chatApi = {
  endpoint: `${API_URL}/telegram`,
  
  getUserId: () => {
    let odId = localStorage.getItem("chatUserId");
    if (!odId) {
      odId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("chatUserId", odId);
    }
    return odId;
  },

  sendMessage: async (message) => {
    try {
      const response = await api.post('/telegram', {
        action: 'send',
        message,
        userId: chatApi.getUserId(), // Changed from odId to userId
      });
      return response.data;
    } catch (error) {
      console.error('Chat send error:', error);
      return { success: false };
    }
  },

  getMessages: async () => {
    try {
      const response = await api.get('/telegram', {
        params: {
          action: 'get',
          userId: chatApi.getUserId(),
        },
      });
      return response.data;
    } catch (error) {
      return { success: false, messages: [] };
    }
  },

  markAsRead: async (messageId) => {
    try {
      await api.get('/telegram', {
        params: {
          action: 'markRead',
          userId: chatApi.getUserId(), // Changed from odId to userId
          messageId,
        },
      });
    } catch (error) {
      // Ignore
    }
  },

  getQuickReplies: async () => {
    try {
      const response = await api.get('/telegram', {
        params: { action: 'getQuickReplies' },
      });
      return response.data.quickReplies || {};
    } catch (error) {
      return {};
    }
  },

  getOperatorInfo: async () => {
    try {
      const response = await api.get('/telegram', {
        params: { action: 'getOperatorInfo' },
      });
      return response.data.operatorInfo || null;
    } catch (error) {
      return null;
    }
  },
};

// Google Sheets backup
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzIuKKLnno4ft6uZkoZPR-wO7qiWYO7ju0fLK5yzWvwmqL0IEVCjKNmngqIC1ONVG_Teg/exec";

export const sendToGoogleSheets = async (data) => {
  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export default api;
