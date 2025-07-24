import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;

type CardProps = {
    title: string;
    value: string;
    description: string;
};

const DashboardCard: React.FC<CardProps> = ({ title, value, description}) => {
    return (
        <div className='bg-white h-full w-full rounded-lg grid place-content-center p-5 shadow-sm'>
            <h3 className='font-bold text-sm'>{title}</h3>
            <p className='text-2xl font-bold mt-6'>{value}</p>
            <small>{description}</small>
        </div>
    );
};

export default DashboardCard;
