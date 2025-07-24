import React from 'react';
import InputField from '../../../../components/Common/InputField';
import TypographySetting from '../../../../components/TypographySetting';

interface Props {
    formValues: FormValues;
    handleChange: (section: keyof FormValues['banner'], key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HeadlineSection: React.FC<Props> = ({formValues, handleChange}) => {
    const excludeFields = ["hoverTextColor"];
    return (
        <section className="grid grid-cols-1 gap-4 ml-5 mr-5">
                <InputField label="Text" value={formValues.banner.headline.text} type="text"
                            onChange={handleChange('headline', 'text')}/>

                <TypographySetting formValues={formValues} handleChange={handleChange} component="headline" excludeFields={excludeFields}/>
            </section>);
};
