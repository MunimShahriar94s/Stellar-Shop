import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const IframeContainer = styled.div`
  margin-top: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 120px;
  border: none;
`;

const OAuthIframe = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Add message listener for communication from iframe
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'oauth-redirect') {
        window.location.href = event.data.url;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <IframeContainer>
      <StyledIframe 
        ref={iframeRef}
        src="/oauth-iframe.html" 
        title="OAuth Login"
        sandbox="allow-scripts allow-same-origin"
      />
    </IframeContainer>
  );
};

export default OAuthIframe;