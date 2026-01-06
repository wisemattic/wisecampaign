import React from 'react';
import InputField from '../../../../components/Common/InputField';
import ImageUpload from "../../../../components/Common/ImageUpload";

interface Props {
    formValues: FormValues;
    handleChange: (section: keyof FormValues['banner'], key: string, unit?: string | null) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BogoSection: React.FC<Props> = ({formValues, handleChange}) => {

    const handleImageUpload = (file: File | null) => {
        // Manually call the handleChange for the 'bgImage'
        const event = {
            target: {
                type: 'file',
                files: file ? [file] : [],
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        handleChange('bogo', 'imgSrc')(event);
    };

    return (<section className={`grid grid-cols-1 md:grid-cols-2 gap-4 ml-5 mr-5 ${!formValues.banner.bogo?.show ? 'opacity-50 pointer-events-none' : ''}`}>

                <ImageUpload label="Bogo Image (110x70px recommended)" onImageUpload={handleImageUpload} />

                <InputField
                    label="Image Alt"
                    value={formValues.banner.bogo.alt}
                    type="text"
                    onChange={handleChange('bogo', 'alt')}
                />
                <InputField
                    label="Image width"
                    value={formValues.banner.bogo.width.replace("px","")}
                    type="range"
                    min={0}
                    max={500}
                    unit="px"
                    onChange={handleChange('bogo', 'width', 'px')}
                />
                <InputField
                    label="Image height"
                    value={formValues.banner.bogo.height.replace("px","")}
                    type="range"
                    min={0}
                    max={Number(formValues.banner.general.height.replace("px",""))}
                    unit="px"
                    onChange={handleChange('bogo', 'height', "px")}
                />  
            </section>);
};
