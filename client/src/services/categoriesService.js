const API_BASE_URL = '/api/categories';

// Get all categories (public)
export const getAllCategories = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get all categories (admin - includes inactive)
export const getAdminCategories = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    throw error;
  }
};

// Get single category
export const getCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

// Create new category
export const createCategory = async (categoryData) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', categoryData.name);
    formData.append('description', categoryData.description || '');
    formData.append('is_active', categoryData.is_active || true);
    formData.append('sort_order', categoryData.sort_order || 0);
    
    // Add image if provided
    if (categoryData.image && categoryData.image instanceof File) {
      formData.append('image', categoryData.image);
    }
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create category');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update category
export const updateCategory = async (id, categoryData) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    // Add text fields
    if (categoryData.name) formData.append('name', categoryData.name);
    if (categoryData.description !== undefined) formData.append('description', categoryData.description);
    if (categoryData.is_active !== undefined) formData.append('is_active', categoryData.is_active);
    if (categoryData.sort_order !== undefined) formData.append('sort_order', categoryData.sort_order);
    
    // Add image if provided
    if (categoryData.image && categoryData.image instanceof File) {
      formData.append('image', categoryData.image);
    }
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update category');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete category');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Toggle category active status
export const toggleCategoryStatus = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to toggle category status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error toggling category status:', error);
    throw error;
  }
};
