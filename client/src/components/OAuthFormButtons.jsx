import React from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const FormTitle = styled.p`
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: 500;
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #ea4335;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #d62516;
  }
`;

const FacebookButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  background-color: #1877f2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #0a60d6;
  }
`;

const OAuthFormButtons = () => {
  return (
    <FormContainer>
      <FormTitle>OAuth Form Submit</FormTitle>
      <form action="/auth/google" method="get" target="_blank">
        <GoogleButton type="submit">
          Google (Form Submit)
        </GoogleButton>
      </form>
      {/* Facebook OAuth removed */}
    </FormContainer>
  );
};

export default OAuthFormButtons;