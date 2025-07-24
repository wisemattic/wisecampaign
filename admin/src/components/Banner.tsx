import React from 'react';
import styled from 'styled-components';

const BannerContainer = styled.div`
  background-color: #5c56f5;
  color: white;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const PromoText = styled.div`
  font-size: 18px;
`;

const Timer = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
`;

const Button = styled.button`
  background-color: #ffdd57;
  color: black;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #ffc107;
  }
`;

const Banner: React.FC = () => {
    return (
        <BannerContainer>
            <PromoText>
                Get 10% Off Hosting: on 12 months plans & Longer! <br />
                Promocode: <strong>RECHARGE100</strong>
            </PromoText>
            <Timer>57:12:46:03</Timer>
            <Button>Claim offer</Button>
        </BannerContainer>
    );
};

export default Banner;
