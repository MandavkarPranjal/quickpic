"use client";

import { usePlausible } from "next-plausible";
import { UploadBox } from "@/components/shared/upload-box";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
    type FileUploaderResult,
    useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";

const FONTS = [
    { name: 'Limelight', value: 'Limelight' },
    { name: 'UnifrakturMaguntia', value: 'UnifrakturMaguntia' },
    { name: 'Fascinate', value: 'Fascinate' },
    { name: 'Sour Gummy', value: 'Sour Gummy' },
    { name: 'Schoolbell', value: 'Schoolbell' }
];

function BlurToolCore(props: { fileUploaderProps: FileUploaderResult }) {
    const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
        props.fileUploaderProps;

    const [blurredImageContent, setBlurredImageContent] = useState<string | null>(null);
    const [blurLevel, setBlurLevel] = useState<number>(5);
    const [overlayText, setOverlayText] = useState<string>("Your Text Here");
    const [textSize, setTextSize] = useState<number>(48);
    const [textColor, setTextColor] = useState<string>("#ffffff");
    const [selectedFont, setSelectedFont] = useState<string>("Limelight");

    useEffect(() => {
        if (imageContent && imageMetadata) {
            const image = new Image();
            image.onload = async () => {
                try {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if (!ctx) {
                        throw new Error("Could not get canvas context");
                    }

                    canvas.width = image.width;
                    canvas.height = image.height;

                    // Apply blur effect
                    ctx.filter = `blur(${blurLevel}px)`;
                    ctx.drawImage(image, 0, 0);

                    // Reset filter for text
                    ctx.filter = 'none';

                    // Add text overlay
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = textColor;
                    ctx.font = `${textSize}px "${selectedFont}"`;
                    
                    // Add text stroke for better visibility
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.lineWidth = 3;
                    ctx.strokeText(overlayText, canvas.width / 2, canvas.height / 2);
                    ctx.fillText(overlayText, canvas.width / 2, canvas.height / 2);

                    // Get the data URL of the blurred image
                    const blurredImage = canvas.toDataURL('image/jpeg');
                    setBlurredImageContent(blurredImage);
                } catch (err) {
                    console.error("Blurring image failed", err);
                }
            };
            image.src = imageContent;
        }
    }, [imageContent, imageMetadata, blurLevel, overlayText, textSize, textColor, selectedFont]);

    const handleSaveImage = () => {
        if (blurredImageContent && imageMetadata) {
            const link = document.createElement("a");
            link.href = blurredImageContent;
            const originalFileName = imageMetadata.name;
            const fileNameWithoutExtension =
                originalFileName.substring(0, originalFileName.lastIndexOf(".")) || originalFileName;
            const fileExtension = originalFileName.split('.').pop();
            link.download = `${fileNameWithoutExtension}-blurred.${fileExtension || 'jpg'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const plausible = usePlausible();

    if (!imageMetadata) {
        return (
            <UploadBox
                title="Add blur effect and text overlay to images"
                subtitle="Customize blur intensity and text appearance"
                description="Upload Image"
                accept="image/*"
                onChange={handleFileUploadEvent}
            />
        );
    }

    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
            <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
                {blurredImageContent && (
                    <img src={blurredImageContent} alt="Preview" className="mb-4 max-w-full" />
                )}
                <p className="text-lg font-medium text-white/80">
                    {imageMetadata.name}
                </p>
                <div className="w-full max-w-md space-y-4">
                    <div>
                        <label htmlFor="blur-slider" className="block mb-2 text-sm font-medium text-white/80">
                            Blur Level: {blurLevel}px
                        </label>
                        <input
                            id="blur-slider"
                            type="range"
                            min="0"
                            max="20"
                            value={blurLevel}
                            onChange={(e) => setBlurLevel(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <label htmlFor="text-input" className="block mb-2 text-sm font-medium text-white/80">
                            Overlay Text
                        </label>
                        <input
                            id="text-input"
                            type="text"
                            value={overlayText}
                            onChange={(e) => setOverlayText(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="font-select" className="block mb-2 text-sm font-medium text-white/80">
                            Font Style
                        </label>
                        <select
                            id="font-select"
                            value={selectedFont}
                            onChange={(e) => setSelectedFont(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
                            style={{ fontFamily: selectedFont }}
                        >
                            {FONTS.map((font) => (
                                <option 
                                    key={font.value} 
                                    value={font.value}
                                    style={{ fontFamily: font.value }}
                                >
                                    {font.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="text-size" className="block mb-2 text-sm font-medium text-white/80">
                            Text Size: {textSize}px
                        </label>
                        <input
                            id="text-size"
                            type="range"
                            min="12"
                            max="120"
                            value={textSize}
                            onChange={(e) => setTextSize(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <label htmlFor="text-color" className="block mb-2 text-sm font-medium text-white/80">
                            Text Color
                        </label>
                        <input
                            id="text-color"
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full h-10 bg-gray-700 rounded-lg cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={cancel}
                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        plausible("blur-text-image");
                        handleSaveImage();
                    }}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                >
                    Save Image
                </button>
            </div>
        </div>
    );
}

export function BlurTool() {
    const fileUploaderProps = useFileUploader();

    return (
        <FileDropzone
            setCurrentFile={fileUploaderProps.handleFileUpload}
            acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp"]}
            dropText="Drop image file"
        >
            <BlurToolCore fileUploaderProps={fileUploaderProps} />
        </FileDropzone>
    );
}