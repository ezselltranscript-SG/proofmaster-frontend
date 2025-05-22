import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 3rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
  
  span {
    margin-left: 0.3rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  a {
    text-decoration: none;
    color: #555;
  }
`;

const Button = styled.button`
  background-color: #2979ff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #1c54b2;
  }
`;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <Logo>🔤 <span>ProofMaster</span></Logo>
      <Nav>
        {user ? (
          <>
            <span>{user.email}</span>
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <Button onClick={() => navigate('/login')}>Login</Button>
        )}
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
