"use client";

import { usePlausible } from "next-plausible";
import { UploadBox } from "@/components/shared/upload-box";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { OptionSelector } from "@/components/shared/option-selector";
import { SliderSelector } from "@/components/slider-selector";
import {
    type FileUploaderResult,
    useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

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
    const [blurLevel, setBlurLevel] = useLocalStorage<number>("blurTool_blurLevel", 5);
    const [isCustomBlur, setIsCustomBlur] = useState(false);
    const [overlayText, setOverlayText] = useLocalStorage<string>("blurTool_overlayText", "Your Text Here");
    const [textSize, setTextSize] = useLocalStorage<number>("blurTool_textSize", 48);
    const [isCustomSize, setIsCustomSize] = useState(false);
    const [textColor, setTextColor] = useLocalStorage<string>("blurTool_textColor", "#ffffff");
    const [selectedFont, setSelectedFont] = useLocalStorage<string>("blurTool_selectedFont", "Limelight");

    const handleBlurChange = (value: number | "custom") => {
        if (value === "custom") {
            setIsCustomBlur(true);
        } else {
            setBlurLevel(value);
            setIsCustomBlur(false);
        }
    };

    const handleSizeChange = (value: number | "custom") => {
        if (value === "custom") {
            setIsCustomSize(true);
        } else {
            setTextSize(value);
            setIsCustomSize(false);
        }
    };

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
                originalFileName.substring(0, originalFileName.lastIndexOf(".")) ?? originalFileName;
            const fileExtension = originalFileName.split('.').pop();
            link.download = `${fileNameWithoutExtension}-blurred.${fileExtension ?? 'jpg'}`;
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
                    <div className="relative w-full max-w-lg">
                        <img 
                            src={blurredImageContent} 
                            alt="Preview" 
                            className="w-full h-auto rounded-lg"
                            style={{ maxHeight: "400px", objectFit: "contain" }}
                        />
                    </div>
                )}
                <p className="text-lg font-medium text-white/80">
                    {imageMetadata.name}
                </p>
            </div>

            <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
                <span className="text-sm text-white/60">Original Size</span>
                <span className="font-medium text-white">
                    {imageMetadata.width} × {imageMetadata.height}
                </span>
            </div>

            <SliderSelector
                title="Blur Level"
                options={[0, 2, 5, 10, 15, 20]}
                selected={isCustomBlur ? "custom" : blurLevel}
                onChange={handleBlurChange}
                customValue={blurLevel}
                onCustomValueChange={setBlurLevel}
                min={0}
                max={50}
                unit="px"
                placeholder="Enter blur"
            />

            <SliderSelector
                title="Text Size"
                options={[12, 24, 36, 48, 72, 96]}
                selected={isCustomSize ? "custom" : textSize}
                onChange={handleSizeChange}
                customValue={textSize}
                onCustomValueChange={setTextSize}
                min={8}
                max={200}
                unit="px"
                placeholder="Enter size"
            />

            <OptionSelector
                title="Font Style"
                options={FONTS.map(font => font.value)}
                selected={selectedFont}
                onChange={setSelectedFont}
                formatOption={(option) => FONTS.find(f => f.value === option)?.name ?? option}
            />

            <div className="flex flex-col items-center gap-3 w-full max-w-md">
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-sm text-white/60 text-center">Overlay Text</label>
                    <input
                        type="text"
                        value={overlayText}
                        onChange={(e) => setOverlayText(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 rounded-lg text-white text-center border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Enter your text here"
                    />
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <label className="text-sm text-white/60 text-center">Text Color</label>
                    <div className="flex justify-center">
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-16 h-10 bg-white/5 rounded-lg cursor-pointer border border-white/10"
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