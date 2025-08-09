import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const OAuthButton = styled.a`
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
`;

const GoogleButton = styled(OAuthButton)`
  background-color: #fff;
  color: #757575;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #f1f1f1;
  }
`;

// Facebook OAuth removed

const FormContainer = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const DirectLinkContainer = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const DirectLink = styled.a`
  color: #333;
  text-decoration: underline;
  font-weight: 500;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const OAuthTest = () => {
  return (
    <Container>
      <Title>OAuth Testing Page</Title>
      
      <ButtonContainer>
        <GoogleButton href="http://localhost:3000/auth/google">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </GoogleButton>
        
        {/* Facebook OAuth removed */}
      </ButtonContainer>
      
      <FormContainer>
        <Form action="http://localhost:3000/auth/google" method="get">
          <button type="submit">Google Auth (Form Submit)</button>
        </Form>
        
        {/* Facebook OAuth removed */}
      </FormContainer>
      
      <DirectLinkContainer>
        <DirectLink 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            window.location.href = 'http://localhost:3000/auth/google';
          }}
        >
          Google (window.location)
        </DirectLink>
        
        {/* Facebook OAuth removed */}
      </DirectLinkContainer>
    </Container>
  );
};

export default OAuthTest;