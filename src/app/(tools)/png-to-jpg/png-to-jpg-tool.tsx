"use client";

import { usePlausible } from "next-plausible";
import { UploadBox } from "@/components/shared/upload-box";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
    type FileUploaderResult,
    useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";


function PngToJpgToolCore(props: { fileUploaderProps: FileUploaderResult }) {
    const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
        props.fileUploaderProps;

    const [convertedImageContent, setConvertedImageContent] = useState<string | null>(null);
    const [quality, setQuality] = useState(90);

    useEffect(() => {
        if (imageContent && imageMetadata) {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                
                if (!ctx) return;

                canvas.width = image.width;
                canvas.height = image.height;

                // Fill with white background (for transparency)
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw the image
                ctx.drawImage(image, 0, 0);

                // Convert to JPEG with specified quality
                const jpegDataUrl = canvas.toDataURL("image/jpeg", quality / 100);
                setConvertedImageContent(jpegDataUrl);
            };
            image.src = imageContent;
        }
    }, [imageContent, imageMetadata, quality]);

    const handleSaveConvertedImage = () => {
        if (convertedImageContent && imageMetadata) {
            const link = document.createElement("a");
            link.href = convertedImageContent;
            const originalFileName = imageMetadata.name;
            const fileNameWithoutExtension =
                originalFileName.substring(0, originalFileName.lastIndexOf(".")) || originalFileName;
            link.download = `${fileNameWithoutExtension}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const plausible = usePlausible();

    if (!imageMetadata) {
        return (
            <UploadBox
                title="Convert PNG to JPG with quality control. Fast and free."
                subtitle="Allows pasting images from clipboard"
                description="Upload PNG Image"
                accept="image/png"
                onChange={handleFileUploadEvent}
            />
        );
    }

    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
            <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
                {convertedImageContent && (
                    <img src={convertedImageContent} alt="Preview" className="mb-4 max-w-full" />
                )}
                <p className="text-lg font-medium text-white/80">
                    {imageMetadata.name}
                </p>
            </div>

            <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-white/80 mb-2">
                    JPEG Quality: {quality}%
                </label>
                <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>10%</span>
                    <span>100%</span>
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
                        plausible("png-to-jpg");
                        handleSaveConvertedImage();
                    }}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                >
                    Save as JPG
                </button>
            </div>
        </div>
    );
}

export function PngToJpgTool() {
    const fileUploaderProps = useFileUploader();

    return (
        <FileDropzone
            setCurrentFile={fileUploaderProps.handleFileUpload}
            acceptedFileTypes={["image/png", ".png"]}
            dropText="Drop PNG file"
        >
            <PngToJpgToolCore fileUploaderProps={fileUploaderProps} />
        </FileDropzone>
    );
}