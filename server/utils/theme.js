import db from '../db.js';

export const getThemeSettings = async () => {
  try {
    const res = await db.query(
      `SELECT category, key_name, value FROM settings 
       WHERE (category = 'general' AND key_name IN ('storeName'))
          OR (category = 'appearance' AND key_name IN ('primaryColor','secondaryColor','logo'))`
    );
    const map = {};
    for (const row of res.rows) {
      map[`${row.category}.${row.key_name}`] = row.value;
    }
    const storeName = map['general.storeName'] || 'StellarShop';
    const primaryColor = map['appearance.primaryColor'] || '#ff6b6b';
    const secondaryColor = map['appearance.secondaryColor'] || '#e05050';
    const logo = map['appearance.logo'] || '';
    return { storeName, primaryColor, secondaryColor, logo };
  } catch {
    return { storeName: 'StellarShop', primaryColor: '#ff6b6b', secondaryColor: '#e05050', logo: '' };
  }
};


