import React from 'react';
import InputField from '../../../../components/Common/InputField';
import { Typography } from '@material-tailwind/react';
import TypographySetting from '../../../../components/TypographySetting';

interface Props {
    formValues: FormValues;
    handleChange: (section: keyof FormValues['banner'], key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SubHeadlineSection: React.FC<Props> = ({formValues, handleChange}) => {
    return ( <section className="grid grid-cols-1 gap-4 ml-5 mr-5">
                <InputField
                    label="Text"
                    value={formValues.banner.subHeadline.text}
                    type="text"
                    onChange={handleChange('subHeadline', 'text')}
                />
                <TypographySetting formValues={formValues} handleChange={handleChange} component='subHeadline' excludeFields={["hoverTextColor"]}/>
            </section>);
};
