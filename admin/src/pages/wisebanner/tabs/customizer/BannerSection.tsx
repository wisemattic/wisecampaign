import React, { useEffect } from 'react';
import InputField from '../../../../components/Common/InputField';
import ImageUpload from "../../../../components/Common/ImageUpload";

interface Props {
    formValues: FormValues;
    handleChange: (section: keyof FormValues['banner'], key: string, unit?: string | null) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BannerSection: React.FC<Props> = ({formValues, handleChange}) => {

    const handleImageUpload = (file: File | null) => {
        // Manually call the handleChange for the 'bgImage'
        const event = {
            target: {
                type: 'file',
                files: file ? [file] : [],
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        handleChange('general', 'bgImage')(event);
    };

    return (

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-5 mr-5">
                <ImageUpload label="Background Image (1200x90px recommended)" onImageUpload={handleImageUpload} previousBanner={formValues?.banner?.general?.bgImage} />
               
                <InputField label="Background Color" value={formValues.banner.general.bannerColor} type="color"
                            onChange={handleChange('general', 'bannerColor')}/>
                <InputField label="Width" value={formValues.banner.general.width.replace("%","")} type="range" min={0} max={100} unit='%'
                            onChange={handleChange('general', 'width', '%')}/>
                <InputField label="Height" value={formValues.banner.general.height.replace("px","")} type="range" min={0} max={300} unit='px'
                            onChange={handleChange('general', 'height', 'px')}/>
            </section>);
};
