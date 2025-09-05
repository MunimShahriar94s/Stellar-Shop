import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const VerificationContainer = styled.div`
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #38a169;
  background: #c6f6d5;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.9rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      setLoading(true);
      const response = await fetch(`/email-verification/verify/${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('Please log in to resend verification email');
        return;
      }

      const response = await fetch('/email-verification/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent successfully! Check your inbox.');
      } else {
        setMessage(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('An error occurred while resending verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <PageContainer>
        <VerificationContainer>
          <LoadingSpinner />
          <Title>Verifying your email...</Title>
          <Message>Please wait while we verify your email address.</Message>
        </VerificationContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <VerificationContainer>
        {status === 'success' && (
          <>
            <Icon>🎉</Icon>
            <Title>Email Verified!</Title>
            <SuccessMessage>{message}</SuccessMessage>
            <Message>
              Welcome to StellarShop! Your email has been successfully verified. 
              You now have access to all our features and exclusive deals.
            </Message>
            <Button onClick={handleGoHome}>
              🛍️ Start Shopping
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Icon>❌</Icon>
            <Title>Verification Failed</Title>
            <ErrorMessage>{message}</ErrorMessage>
            <Message>
              The verification link may be invalid or expired. 
              Please try again or contact support if the problem persists.
            </Message>
            <div>
              <Button onClick={handleResendVerification} disabled={loading}>
                {loading && <LoadingSpinner />}
                📧 Resend Verification Email
              </Button>
              <Button onClick={handleGoToLogin}>
                🔐 Go to Login
              </Button>
            </div>
          </>
        )}
      </VerificationContainer>
    </PageContainer>
  );
};

export default EmailVerificationPage; 