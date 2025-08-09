import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const EmailIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
    }
    70% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
    }
  }

  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const InfoBox = styled.div`
  background: #f7fafc;
  border-left: 4px solid #667eea;
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 8px;
  text-align: left;
`;

const InfoTitle = styled.h3`
  color: #2d3748;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const InfoText = styled.p`
  color: #4a5568;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const CloseMessage = styled.div`
  background: #e6fffa;
  border: 1px solid #81e6d9;
  border-radius: 8px;
  padding: 1rem;
  margin: 2rem 0;
  color: #22543d;
  font-weight: 500;
`;

const Button = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  margin: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-block;
  background: transparent;
  color: #667eea;
  padding: 12px 24px;
  text-decoration: none;
  border: 2px solid #667eea;
  border-radius: 50px;
  font-weight: 600;
  margin: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const CheckEmailPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageContainer>
      <Card>
        <EmailIcon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </EmailIcon>

        <Title>Check Your Email</Title>
        <Subtitle>
          We've sent you a verification link to complete your registration. 
          Please check your inbox and click the verification button.
        </Subtitle>

        <InfoBox>
          <InfoTitle>📧 What to do next:</InfoTitle>
          <InfoText>
            1. Open your email inbox<br/>
            2. Look for an email from "StellarShop"<br/>
            3. Click the "Verify Email" button in the email<br/>
            4. You'll be automatically logged in and redirected
          </InfoText>
        </InfoBox>

        <InfoBox>
          <InfoTitle>⏰ Important:</InfoTitle>
          <InfoText>
            • The verification link expires in <strong>60 minutes</strong><br/>
            • Check your spam folder if you don't see the email<br/>
            • Make sure to use the same email you registered with
          </InfoText>
        </InfoBox>

        <CloseMessage>
          ✅ <strong>You may close this tab now</strong> - just remember to check your email!
        </CloseMessage>

        <div>
          <Button to="/login">Go to Login</Button>
          <SecondaryButton to="/">Back to Home</SecondaryButton>
        </div>
      </Card>
    </PageContainer>
  );
};

export default CheckEmailPage; 