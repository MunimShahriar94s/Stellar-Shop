// This script provides direct OAuth redirection functions
function redirectToGoogle() {
  console.log('Redirecting to Google OAuth...');
  window.location.href = '/auth/google';
}

// Expose functions to global scope
window.oauthHelpers = {
  redirectToGoogle
};