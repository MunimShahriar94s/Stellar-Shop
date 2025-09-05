import { productsAPI } from './api';

// Fetch all products
export const fetchProducts = async () => {
  return productsAPI.getAll();
};

// Fetch a single product by ID
export const fetchProductById = async (id) => {
  return productsAPI.getById(id);
};

// Fetch products by category
export const fetchProductsByCategory = async (category) => {
  const allProducts = await productsAPI.getAll();
  return allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
};