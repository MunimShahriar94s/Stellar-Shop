import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-color);
`;

const SignupContainer = styled.div`
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

const SignupImage = styled.div`
  flex: 1;
  background-image: url('https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');
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

const SignupImageText = styled.div`
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

const SignupForm = styled.div`
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

const LoginPrompt = styled.div`
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

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser, setIsAdmin } = useAuth();
  const { mergeCart, ensureUserCart, fetchCart } = useCart();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Handle successful registration

      
      // Handle response based on whether user was logged in automatically
      setError(''); // Clear any previous errors
      
      if (data.token && data.user) {
        // User was automatically logged in (OAuth user created local password)
        localStorage.setItem('token', data.token);
        setUser(data.user); // Update auth context
        setIsAdmin(data.user.role === 'admin'); // Set admin status

        // Always check for guest cart and merge before redirecting
        const guestCartId = document.cookie.split('; ').find(row => row.startsWith('guestCartId='));
        if (guestCartId) {
          try {
            await mergeCart();
            await fetchCart(); // Always refresh cart after merging
          } catch (error) {
            console.error('Error merging cart during registration:', error);
          }
        }
        // Now fetch the cart to update UI if no guest cart
        if (!guestCartId) {
          await fetchCart();
        }
        navigate('/'); // Redirect to home page
      } else if (data.message && data.message.includes('Local password created successfully')) {
        // Local password was created but needs email verification
        navigate('/check-email');
      } else {
        // New account created - redirect to check email page
        navigate('/check-email');
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <SignupContainer>
        <SignupImage>
          <SignupImageText>
            <h2>Join Our Community</h2>
            <p>Create an account to start shopping and get exclusive offers</p>
          </SignupImageText>
        </SignupImage>
        
        <SignupForm>
          <FormTitle>Create Account</FormTitle>
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                type="text" 
                id="name" 
                name="name"
                value={formData.name} 
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input 
                type="password" 
                id="password" 
                name="password"
                value={formData.password} 
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </FormGroup>
            
            {error && (
              <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
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
          
          <LoginPrompt>
            Already have an account? <Link to="/login">Sign in</Link>
          </LoginPrompt>
        </SignupForm>
      </SignupContainer>
    </PageContainer>
  );
};

export default SignupPage;