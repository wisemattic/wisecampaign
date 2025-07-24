import React from 'react';
import InputField from '../../../../components/Common/InputField';
import TypographySetting from '../../../../components/TypographySetting';
import CountdownStyleSelector from '../../../../components/CountdownStyleSelector';

interface Props {
    formValues: FormValues;
    handleChange: (section: keyof FormValues['banner'], key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheckedBannerChange: (banner: any) => void;
}

export const CountdownSection: React.FC<Props> = ({formValues, handleChange}) => {
    return (
            <section className="grid grid-cols-1 gap-4 ml-4 mr-4">
                <CountdownStyleSelector/>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField
                    label="Text"
                    value={formValues.banner.countdown.text}
                    type="text"
                    onChange={handleChange('countdown', 'text')}
                />
                <InputField
                    label="Timer"
                    value={formValues.banner.countdown.timer}
                    type="datetime-local"
                    onChange={handleChange('countdown', 'timer')}
                />
                </div>
                <TypographySetting formValues={formValues} handleChange={handleChange} component={'countdown'} excludeFields={["hoverTextColor","align"]}/>
        </section>);
};
