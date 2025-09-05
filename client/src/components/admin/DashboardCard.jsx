import styled from 'styled-components';

const CardContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px var(--shadow-color);
  }
`;

const IconContainer = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background-color: ${props => props.bgColor || 'rgba(255, 107, 107, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.iconColor || 'var(--primary-color)'};
  }
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 0.9rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  opacity: 0.7;
`;

const CardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
`;

const CardTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.positive ? 'var(--success-color)' : 'var(--danger-color)'};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DashboardCard = ({ title, value, icon, trend, trendValue, bgColor, iconColor }) => {
  return (
    <CardContainer>
      <IconContainer bgColor={bgColor} iconColor={iconColor}>
        {icon}
      </IconContainer>
      
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardValue>{value}</CardValue>
        
        {trend && (
          <CardTrend positive={trend === 'up'}>
            {trend === 'up' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 15L12 9L6 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {trendValue}
          </CardTrend>
        )}
      </CardContent>
    </CardContainer>
  );
};

export default DashboardCard;