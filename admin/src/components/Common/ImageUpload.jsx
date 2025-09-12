import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';

const ImageUpload = ({ label, onImageUpload, previousBanner }) => {
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (previousBanner && previousBanner !== 'null') {
            setPreview(previousBanner);
        } else {
            setPreview(null);
        }
    }, [previousBanner]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            console.log("objectUrl:", objectUrl);
            setPreview(objectUrl);
            onImageUpload(file);

            // Use FileReader for base64 preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result); // base64 string
    };
    reader.readAsDataURL(file);


        } else {
            setImageFile(null);
            setPreview(null);
            onImageUpload(null);
        }
    };

    return (
        <div className="image-upload relative">
    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
        {label}
    </label>
    <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />

    {preview && (
        <div className="preview relative mt-2">
            <img
                src={preview}
                alt="Image Preview"
                className="w-full h-auto max-h-64 object-contain border rounded-lg shadow-md"
            />
            <button
                onClick={() => {
                    setImageFile(null);
                    setPreview(null);
                    onImageUpload(null); // Clear the file and preview
                }}
                className="absolute top-2 right-2 rounded-full focus:outline-none text-center"
                aria-label="Delete image"
            >
                <FaTrash className="text-lg text-red-600 hover:scale-125"/>
            </button>
        </div>
    )}
</div>
    );
};

export default ImageUpload;