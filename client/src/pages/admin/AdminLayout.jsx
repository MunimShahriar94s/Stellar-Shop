import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../components/admin/Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  @media (max-width: 600px) {
    flex-direction: column;
    max-width: 100vw;
    overflow-x: hidden;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 250px;
  background-color: var(--bg-color);
  min-height: 100vh;
  transition: margin-left 0.3s;
  @media (max-width: 768px) {
    margin-left: 70px;
  }
  @media (max-width: 600px) {
    margin-left: 0;
    width: 100vw;
    min-width: 0;
    max-width: 100vw;
    overflow-x: hidden;
  }
`;

const SidebarToggle = styled.button`
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1001;
  background: var(--primary-color, #ff6b6b);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.8rem;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  @media (max-width: 600px) {
    display: block;
  }
`;

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 900;
  return (
    <LayoutContainer>
      {/* SidebarToggle button removed; now handled by Header */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MainContent style={{ marginLeft: isSmallScreen ? 0 : undefined }}>
        <Outlet context={{ onMenuClick: () => setSidebarOpen(true) }} />
      </MainContent>
    </LayoutContainer>
  );
}
export default AdminLayout;