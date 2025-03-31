"use client";

import { usePlausible } from "next-plausible";
import { UploadBox } from "@/components/shared/upload-box";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
    type FileUploaderResult,
    useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";

function NoiseToolCore(props: { fileUploaderProps: FileUploaderResult }) {
    const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
        props.fileUploaderProps;

    const [noisyImageContent, setNoisyImageContent] = useState<string | null>(null);
    const [noiseLevel, setNoiseLevel] = useState<number>(30); // Default noise level (0-100)

    useEffect(() => {
        if (imageContent && imageMetadata) {
            const image = new Image();
            image.onload = async () => {
                try {
                    // Create a canvas to draw the image
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if (!ctx) {
                        throw new Error("Could not get canvas context");
                    }

                    // Set canvas dimensions to match image
                    canvas.width = image.width;
                    canvas.height = image.height;

                    // Draw the original image onto the canvas
                    ctx.drawImage(image, 0, 0);

                    // Get image data to manipulate pixels
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Add noise to the image
                    const noiseIntensity = noiseLevel / 100 * 255; // Convert percentage to pixel value

                    for (let i = 0; i < data.length; i += 4) {
                        // Add random noise to RGB channels
                        for (let j = 0; j < 3; j++) {
                            const noise = (Math.random() - 0.5) * noiseIntensity;
                            data[i + j] = Math.max(0, Math.min(255, data[i + j]! + noise));
                        }
                    }

                    // Put the modified image data back on the canvas
                    ctx.putImageData(imageData, 0, 0);

                    // Get the data URL of the noisy image
                    const noisyImage = canvas.toDataURL(imageMetadata.type || 'image/jpeg');
                    setNoisyImageContent(noisyImage);
                } catch (err) {
                    console.error("Adding noise failed", err);
                }
            };
            image.src = imageContent;
        }
    }, [imageContent, imageMetadata, noiseLevel]);

    const handleSaveNoisyImage = () => {
        if (noisyImageContent && imageMetadata) {
            const link = document.createElement("a");
            link.href = noisyImageContent;
            const originalFileName = imageMetadata.name;
            const fileNameWithoutExtension =
                originalFileName.substring(0, originalFileName.lastIndexOf(".")) || originalFileName;
            const fileExtension = originalFileName.split('.').pop();
            link.download = `${fileNameWithoutExtension}-noisy.${fileExtension || 'jpg'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const plausible = usePlausible();

    if (!imageMetadata) {
        return (
            <UploadBox
                title="Add noise to images. Fast and free."
                subtitle="Allows pasting images from clipboard"
                description="Upload Image"
                accept="image/*"
                onChange={handleFileUploadEvent}
            />
        );
    }

    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
            <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
                {noisyImageContent && (
                    <img src={noisyImageContent} alt="Preview" className="mb-4" />
                )}
                <p className="text-lg font-medium text-white/80">
                    {imageMetadata.name}
                </p>
                <div className="w-full max-w-md">
                    <label htmlFor="noise-slider" className="block mb-2 text-sm font-medium text-white/80">
                        Noise Level: {noiseLevel}%
                    </label>
                    <input
                        id="noise-slider"
                        type="range"
                        min="0"
                        max="100"
                        value={noiseLevel}
                        onChange={(e) => setNoiseLevel(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
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
                        plausible("add-noise-to-image");
                        handleSaveNoisyImage();
                    }}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                >
                    Save Noised Image
                </button>
            </div>
        </div>
    );
}

export function NoiseTool() {
    const fileUploaderProps = useFileUploader();

    return (
        <FileDropzone
            setCurrentFile={fileUploaderProps.handleFileUpload}
            acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
            dropText="Drop image file"
        >
            <NoiseToolCore fileUploaderProps={fileUploaderProps} />
        </FileDropzone>
    );
}
