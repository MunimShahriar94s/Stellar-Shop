import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-color);
`;

const LoginContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1000px;
  background-color: var(--card-bg);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 15px 30px var(--shadow-color);
  border: 1px solid var(--border-color);
  
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 500px;
  }
`;

const LoginImage = styled.div`
  flex: 1;
  background-image: url('https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.8) 0%, rgba(255, 107, 107, 0.4) 100%);
  }
  
  @media (max-width: 768px) {
    min-height: 200px;
  }
`;

const LoginImageText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
  z-index: 1;
  width: 80%;
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }
  
  p {
    font-size: 1.1rem;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
`;

const LoginForm = styled.div`
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const FormTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--text-color);
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
  }
  
  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
  }
`;

const ForgotPassword = styled.div`
  text-align: right;
  margin-bottom: 1.5rem;
  
  a {
    color: var(--text-color);
    opacity: 0.7;
    text-decoration: none;
    font-size: 0.9rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 2rem 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--border-color);
  }
  
  span {
    padding: 0 1rem;
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.9rem;
  }
`;

const SocialLogin = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OAuthButton = styled.form`
  width: 100%;
  margin: 0;
`;

const OAuthSubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background-color: var(--input-bg);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--border-color);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const GoogleButton = styled(OAuthSubmitButton)`
  color: #ea4335;
`;

// Facebook OAuth removed

const SignupPrompt = styled.div`
  text-align: center;
  margin-top: 2rem;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
  }
`;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();
  const { setUser, setIsAdmin, mergeCart } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    
    try {
  
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Handle successful login

      
      // Check if email is verified
      if (!data.user.emailVerified) {
        setError('Please verify your email address before logging in. Check your inbox for a verification link.');
        return;
      }
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Update auth context
      setUser(data.user);
      setIsAdmin(data.isAdmin);
      
      // Check for guest cart before merging
      const guestCartId = document.cookie.split('; ').find(row => row.startsWith('guestCartId='));
      console.log('Local login - guest cart ID:', guestCartId);
      console.log('Local login - calling mergeCart...');
      
      // Merge guest cart with user cart
      await mergeCart();
      
      console.log('Local login - mergeCart completed');
      
      // Redirect to dashboard or home page
      navigate(data.isAdmin ? '/admin' : '/');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('Please enter your email address first');
      return;
    }
    
    try {
      setResendLoading(true);
      setResendMessage('');
      
      // First try to login to get a token
      const loginResponse = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok) {
        setResendMessage('Please check your email and password');
        return;
      }
      
      // If login successful but email not verified, resend verification
      if (!loginData.user.emailVerified) {
        const token = loginData.token;
        
        const resendResponse = await fetch('/email-verification/resend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        const resendData = await resendResponse.json();
        
        if (resendResponse.ok) {
          setResendMessage('Verification email sent successfully! Check your inbox.');
        } else {
          setResendMessage(resendData.message || 'Failed to resend verification email');
        }
      } else {
        setResendMessage('Your email is already verified. You can log in now.');
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      setResendMessage('An error occurred while resending verification email');
    } finally {
      setResendLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <LoginContainer>
        <LoginImage>
          <LoginImageText>
            <h2>Welcome Back</h2>
            <p>Sign in to access your account and continue your shopping journey</p>
          </LoginImageText>
        </LoginImage>
        
        <LoginForm>
          <FormTitle>Sign In</FormTitle>
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </FormGroup>
            
            <ForgotPassword>
              <Link to="/forgot-password">Forgot password?</Link>
            </ForgotPassword>
            
            {error && (
              <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
                {error.includes('verify your email') && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-color)',
                        textDecoration: 'underline',
                        fontSize: '0.9rem',
                        cursor: resendLoading ? 'not-allowed' : 'pointer',
                        opacity: resendLoading ? 0.6 : 1
                      }}
                    >
                      {resendLoading ? 'Sending...' : '📧 Resend verification email'}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {resendMessage && (
              <div style={{ 
                color: resendMessage.includes('successfully') ? 'var(--success-color)' : 'var(--danger-color)', 
                marginBottom: '1rem', 
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                {resendMessage}
              </div>
            )}
            
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </SubmitButton>
          </form>
          
          <OrDivider>
            <span>OR</span>
          </OrDivider>
          
          <SocialLogin>
            <OAuthButton action="/auth/google" method="get">
              <GoogleButton type="submit">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </GoogleButton>
            </OAuthButton>
            
            {/* Facebook OAuth removed */}
          </SocialLogin>
          
          <SignupPrompt>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </SignupPrompt>
          
        </LoginForm>
      </LoginContainer>
    </PageContainer>
  );
};

export default LoginPage;