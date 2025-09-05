// Settings service for API calls

const API_URL = 'http://localhost:3000/api/settings';

// Get all settings
export const getSettings = async () => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

// Update all settings
export const updateSettings = async (settings) => {
  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Get settings by category
export const getSettingsByCategory = async (category) => {
  try {
    const response = await fetch(`${API_URL}/${category}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch category settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching category settings:', error);
    throw error;
  }
};

// Update settings by category
export const updateSettingsByCategory = async (category, categorySettings) => {
  try {
    const response = await fetch(`${API_URL}/${category}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(categorySettings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update category settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating category settings:', error);
    throw error;
  }
};
