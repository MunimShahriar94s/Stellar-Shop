// Simple in-memory token blacklist
// In a production environment, this should be stored in Redis or a database

const tokenBlacklist = new Set();

// Add a token to the blacklist
export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

// Check if a token is blacklisted
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Clean up expired tokens (simplified version)
// In a real app, you'd use the token's expiration time
export const cleanupBlacklist = () => {
  // This is a simplified example
  // In a real app, you'd remove only expired tokens
  console.log('Token blacklist cleanup would happen here');
};

// Schedule cleanup every hour
setInterval(cleanupBlacklist, 60 * 60 * 1000);

export default {
  blacklistToken,
  isTokenBlacklisted,
  cleanupBlacklist
};