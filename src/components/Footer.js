import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  padding: 1rem 3rem;
  background: #eef2f5;
  margin-top: 2rem;
  font-size: 0.9rem;
`;

const FooterLinks = styled.div`
  a {
    margin-left: 1rem;
    text-decoration: none;
    color: #444;
    transition: color 0.2s ease;
    
    &:hover {
      color: #2979ff;
    }
  }
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <p>© {currentYear} ProofMaster. All rights reserved.</p>
      <FooterLinks>
        <a href="#help">🛟 Help</a>
        <a href="#feedback">💬 Feedback</a>
      </FooterLinks>
    </FooterContainer>
  );
};

export default Footer;
