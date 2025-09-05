import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './Navbar';
import Footer from './Footer';

const Main = styled.main`
  min-height: calc(100vh - 80px);
  padding-top: 70px; /* Space for fixed navbar - matches navbar height */
  @media (max-width: 768px) {
    padding-top: 65px; /* Space for tablet navbar - matches navbar height */
  }
  @media (max-width: 600px) {
    padding-top: 60px; /* Space for mobile navbar - matches navbar height */
  }
`;

const Layout = () => {
  return (
    <>
      <Navbar />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </>
  );
};

export default Layout;