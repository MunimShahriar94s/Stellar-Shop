// This script provides direct OAuth redirection functions
function redirectToGoogle() {
  console.log('Redirecting to Google OAuth...');
  window.location.href = 'http://localhost:3000/auth/google';
}

// Expose functions to global scope
window.oauthHelpers = {
  redirectToGoogle
};