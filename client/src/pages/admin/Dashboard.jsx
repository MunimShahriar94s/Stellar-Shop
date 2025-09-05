import { useEffect } from 'react';
import styled from 'styled-components';
import Header from '../../components/admin/Header';
import DashboardCard from '../../components/admin/DashboardCard';
import { salesData, categoryData, topProducts, recentActivity, dashboardSummary } from '../../data/analytics';
import { useOutletContext } from 'react-router-dom';

const DashboardContainer = styled.div`
  padding: 1.5rem;
  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
  color: var(--text-color);
`;

const ChartContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
`;

const ChartControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ChartButton = styled.button`
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--input-bg)'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: 1px solid var(--input-border);
  border-radius: 4px;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-hover)' : 'var(--border-color)'};
  }
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--input-bg);
  border-radius: 4px;
  color: var(--text-color);
  font-size: 0.9rem;
  opacity: 0.7;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 600px) {
    gap: 0.7rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  @media (max-width: 900px) {
    min-width: 600px;
  }
  @media (max-width: 600px) {
    min-width: unset;
    width: 100%;
    font-size: 0.85rem;
  }
  
  th, td {
    padding: 0.8rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.9rem;
    background-color: var(--input-bg);
  }
  
  td {
    font-size: 0.9rem;
    color: var(--text-color);
  }
  
  tbody tr:hover {
    background-color: var(--input-bg);
  }
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActivityItem = styled.li`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => {
    switch(props.type) {
      case 'order': return 'rgba(76, 175, 80, 0.1)';
      case 'review': return 'rgba(33, 150, 243, 0.1)';
      case 'return': return 'rgba(244, 67, 54, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'order': return '#4caf50';
      case 'review': return '#2196f3';
      case 'return': return '#f44336';
      default: return '#9e9e9e';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 0.9rem;
  color: var(--text-color);
  
  strong {
    font-weight: 600;
    color: var(--text-color);
  }
`;

const ActivityTime = styled.div`
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-top: 0.2rem;
`;

const Dashboard = (props) => {
  const { onMenuClick } = useOutletContext() || {};
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Header title="Dashboard" onMenuClick={onMenuClick} />
      <DashboardContainer>
        <CardsGrid>
          <DashboardCard 
            title="Total Sales" 
            value={`$${dashboardSummary.totalSales.toLocaleString()}`}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1V23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            trend="up"
            trendValue="12% from last month"
          />
          
          <DashboardCard 
            title="Total Orders" 
            value={dashboardSummary.totalOrders}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            bgColor="rgba(33, 150, 243, 0.1)"
            iconColor="#2196f3"
            trend="up"
            trendValue="8% from last month"
          />
          
          <DashboardCard 
            title="Average Order Value" 
            value={`$${dashboardSummary.averageOrderValue}`}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            bgColor="rgba(156, 39, 176, 0.1)"
            iconColor="#9c27b0"
            trend="up"
            trendValue="3% from last month"
          />
          
          <DashboardCard 
            title="Pending Orders" 
            value={dashboardSummary.pendingOrders}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6V12L16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            bgColor="rgba(255, 152, 0, 0.1)"
            iconColor="#ff9800"
          />
        </CardsGrid>
        
        <ChartContainer>
          <ChartHeader>
            <ChartTitle>Sales Overview</ChartTitle>
            <ChartControls>
              <ChartButton>Day</ChartButton>
              <ChartButton>Week</ChartButton>
              <ChartButton active={true}>Month</ChartButton>
              <ChartButton>Year</ChartButton>
            </ChartControls>
          </ChartHeader>
          
          <ChartPlaceholder>
            [Sales Chart - Monthly data visualization would appear here]
          </ChartPlaceholder>
        </ChartContainer>
        
        <GridContainer>
          <ChartContainer>
            <ChartHeader>
              <ChartTitle>Top Selling Products</ChartTitle>
            </ChartHeader>
            
            <Table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.sales}</td>
                    <td>${product.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ChartContainer>
          
          <ChartContainer>
            <ChartHeader>
              <ChartTitle>Recent Activity</ChartTitle>
            </ChartHeader>
            
            <ActivityList>
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index}>
                  <ActivityIcon type={activity.type}>
                    {activity.type === 'order' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {activity.type === 'review' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {activity.type === 'return' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15 9L9 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 9L15 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </ActivityIcon>
                  
                  <ActivityContent>
                    <ActivityText>
                      <strong>{activity.user}</strong> {activity.action}
                    </ActivityText>
                    <ActivityTime>{activity.time}</ActivityTime>
                  </ActivityContent>
                </ActivityItem>
              ))}
            </ActivityList>
          </ChartContainer>
        </GridContainer>
        
        <GridContainer>
          <ChartContainer>
            <ChartHeader>
              <ChartTitle>Sales by Category</ChartTitle>
            </ChartHeader>
            
            <ChartPlaceholder>
              [Category Pie Chart would appear here]
            </ChartPlaceholder>
          </ChartContainer>
          
          <ChartContainer>
            <ChartHeader>
              <ChartTitle>Customer Satisfaction</ChartTitle>
            </ChartHeader>
            
            <ChartPlaceholder>
              [Customer Satisfaction Gauge Chart would appear here]
            </ChartPlaceholder>
          </ChartContainer>
        </GridContainer>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;