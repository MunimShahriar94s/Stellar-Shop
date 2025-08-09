// API service for making requests to the backend

const API_URL = 'http://localhost:3000/api';

// Generic fetch function with error handling
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Products API
export const productsAPI = {
  // Get all products
  getAll: async () => {
    return fetchAPI('/products');
  },
  
  // Get a single product by ID
  getById: async (id) => {
    return fetchAPI(`/products/${id}`);
  },
  
  // Get all products (admin)
  getAdmin: async () => {
    const token = localStorage.getItem('token');
    return fetchAPI('/products/admin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  // Create product
  create: async (productData) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    // Add text fields
    Object.keys(productData).forEach(key => {
      if (key !== 'image' || !(productData[key] instanceof File)) {
        formData.append(key, productData[key]);
      }
    });
    
    // Add image if provided
    if (productData.image && productData.image instanceof File) {
      formData.append('image', productData.image);
    }
    
    return fetchAPI('/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
  },
  
  // Update product
  update: async (id, productData) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    // Add text fields
    Object.keys(productData).forEach(key => {
      if (key !== 'image' || !(productData[key] instanceof File)) {
        formData.append(key, productData[key]);
      }
    });
    
    // Add image if provided
    if (productData.image && productData.image instanceof File) {
      formData.append('image', productData.image);
    }
    
    return fetchAPI(`/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
  },
  
  // Delete product
  delete: async (id) => {
    const token = localStorage.getItem('token');
    return fetchAPI(`/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};