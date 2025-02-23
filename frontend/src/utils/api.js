import API_BASE_URL from '../config.js'

export const fetchAPI = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      return data;
    } catch (error) {
      console.error("API Error:", error.message);
      throw error;
    }
  };