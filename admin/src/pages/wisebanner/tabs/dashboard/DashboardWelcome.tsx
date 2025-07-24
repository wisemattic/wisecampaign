import React from 'react';
import { getPathFor } from '../../../../utils/utils';

const DashboardWelcome: React.FC = () => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 content-center max-h-32 bg-[#564DBD] rounded-md shadow-md'>
            <div className='grid grid-cols-1 gap-2 content-center text-white'>

                <div className='flex justify-center'>
                    <span className='text-lg font-bold'>Welcome back!</span>
                    <img src={getPathFor('wave.png')} className='h-6 ml-3' alt='wave'/>
                </div>

                <div>
                    <span className='block sm:text-sm'>You’ve acheived 70%  of your goal this week!</span>
                    <span className='block sm:text-sm'>Keep it up and improve your progeress.</span>
                </div>

            </div>
            <div className='flex justify-center'>
                <img src={getPathFor('humaaans_space.png')} className='max-h-32' alt='Human' />
            </div>
        </div>
    );
};

export default DashboardWelcome;
