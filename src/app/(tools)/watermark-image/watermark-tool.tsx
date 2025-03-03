"use client";

import { usePlausible } from "next-plausible";
import { UploadBox } from "@/components/shared/upload-box";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
    type FileUploaderResult,
    useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";

function WatermarkToolCore(props: { fileUploaderProps: FileUploaderResult }) {
    const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
        props.fileUploaderProps;

    const [watermarkedImageContent, setWatermarkedImageContent] = useState<string | null>(null);
    const [watermarkText, setWatermarkText] = useState<string>("© 2025 MandavkarPranjal");
    const [watermarkFont, setWatermarkFont] = useState<string>("Arial");
    const [watermarkSize, setWatermarkSize] = useState<number>(24);
    const [watermarkOpacity, setWatermarkOpacity] = useState<number>(50);
    const [watermarkPosition, setWatermarkPosition] = useState<string>("bottomRight");
    const [watermarkColor, setWatermarkColor] = useState<string>("#FFFFFF");

    useEffect(() => {
        if (imageContent && imageMetadata && watermarkText.trim()) {
            applyWatermark();
        }
    }, [imageContent, imageMetadata, watermarkText, watermarkFont, watermarkSize, watermarkOpacity, watermarkPosition, watermarkColor]);

    const applyWatermark = () => {
        if (!imageContent) return;

        const image = new Image();
        image.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    throw new Error("Could not get canvas context");
                }

                canvas.width = image.width;
                canvas.height = image.height;

                // Draw the original image
                ctx.drawImage(image, 0, 0);

                // Set watermark text properties
                ctx.font = `${watermarkSize}px ${watermarkFont}`;
                ctx.fillStyle = watermarkColor;
                ctx.globalAlpha = watermarkOpacity / 100;

                // Measure text width
                const textMetrics = ctx.measureText(watermarkText);
                const textWidth = textMetrics.width;
                const textHeight = watermarkSize;

                // Calculate position
                let x = 0;
                let y = 0;

                switch (watermarkPosition) {
                    case "topLeft":
                        x = 20;
                        y = textHeight + 10;
                        break;
                    case "topCenter":
                        x = (canvas.width - textWidth) / 2;
                        y = textHeight + 10;
                        break;
                    case "topRight":
                        x = canvas.width - textWidth - 20;
                        y = textHeight + 10;
                        break;
                    case "middleLeft":
                        x = 20;
                        y = canvas.height / 2;
                        break;
                    case "middleCenter":
                        x = (canvas.width - textWidth) / 2;
                        y = canvas.height / 2;
                        break;
                    case "middleRight":
                        x = canvas.width - textWidth - 20;
                        y = canvas.height / 2;
                        break;
                    case "bottomLeft":
                        x = 20;
                        y = canvas.height - 20;
                        break;
                    case "bottomCenter":
                        x = (canvas.width - textWidth) / 2;
                        y = canvas.height - 20;
                        break;
                    case "bottomRight":
                    default:
                        x = canvas.width - textWidth - 20;
                        y = canvas.height - 20;
                        break;
                }

                // Add text shadow for better visibility
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                // Draw the watermark text
                ctx.fillText(watermarkText, x, y);

                const watermarked = canvas.toDataURL(imageMetadata?.type || "image/jpeg");
                setWatermarkedImageContent(watermarked);
            } catch (err) {
                console.error("Watermarking failed", err);
            }
        };
        image.src = imageContent;
    };

    const handleSaveWatermarkedImage = () => {
        if (watermarkedImageContent && imageMetadata) {
            const link = document.createElement("a");
            link.href = watermarkedImageContent;
            const originalFileName = imageMetadata.name;
            const fileNameWithoutExtension =
                originalFileName.substring(0, originalFileName.lastIndexOf(".")) || originalFileName;
            link.download = `${fileNameWithoutExtension}-watermarked.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const plausible = usePlausible();

    const fontOptions = [
        "Arial", "Verdana", "Helvetica", "Times New Roman", "Courier New",
        "Georgia", "Palatino", "Garamond", "Bookman", "Trebuchet MS", "Arial Black"
    ];

    const positionOptions = [
        { value: "topLeft", label: "Top Left" },
        { value: "topCenter", label: "Top Center" },
        { value: "topRight", label: "Top Right" },
        { value: "middleLeft", label: "Middle Left" },
        { value: "middleCenter", label: "Middle Center" },
        { value: "middleRight", label: "Middle Right" },
        { value: "bottomLeft", label: "Bottom Left" },
        { value: "bottomCenter", label: "Bottom Center" },
        { value: "bottomRight", label: "Bottom Right" },
    ];

    if (!imageMetadata) {
        return (
            <UploadBox
                title="Add text watermarks to your images. Quick and easy."
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
                {watermarkedImageContent && (
                    <img src={watermarkedImageContent} alt="Preview" className="mb-4 max-w-full max-h-[400px]" />
                )}
                <p className="text-lg font-medium text-white/80">
                    {imageMetadata.name}
                </p>

                <div className="w-full max-w-md space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-white/80">
                            Watermark Text:
                        </label>
                        <input
                            type="text"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white/90 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Enter watermark text"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-white/80">
                                Font:
                            </label>
                            <select
                                value={watermarkFont}
                                onChange={(e) => setWatermarkFont(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white/90 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            >
                                {fontOptions.map((font) => (
                                    <option key={font} value={font}>{font}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-white/80">
                                Position:
                            </label>
                            <select
                                value={watermarkPosition}
                                onChange={(e) => setWatermarkPosition(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white/90 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            >
                                {positionOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-white/80">
                                Font Size: {watermarkSize}px
                            </label>
                            <input
                                type="range"
                                min="8"
                                max="100"
                                value={watermarkSize}
                                onChange={(e) => setWatermarkSize(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-white/80">
                                Opacity: {watermarkOpacity}%
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={watermarkOpacity}
                                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-white/80">
                            Color:
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={watermarkColor}
                                onChange={(e) => setWatermarkColor(e.target.value)}
                                className="h-9 w-9 rounded border-0 bg-transparent p-0"
                            />
                            <input
                                type="text"
                                value={watermarkColor}
                                onChange={(e) => setWatermarkColor(e.target.value)}
                                className="flex-1 bg-gray-700 border border-gray-600 text-white/90 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={() => {
                                setWatermarkText(`© ${new Date().getFullYear()} MandavkarPranjal`);
                                setWatermarkPosition("bottomRight");
                                setWatermarkOpacity(50);
                                setWatermarkSize(24);
                                setWatermarkFont("Arial");
                                setWatermarkColor("#FFFFFF");
                            }}
                            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm text-white/90"
                        >
                            Reset to Default
                        </button>
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
                        plausible("watermark-image");
                        handleSaveWatermarkedImage();
                    }}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                >
                    Save Watermarked Image
                </button>
            </div>
        </div>
    );
}

export function WatermarkTool() {
    const fileUploaderProps = useFileUploader();

    return (
        <FileDropzone
            setCurrentFile={fileUploaderProps.handleFileUpload}
            acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
            dropText="Drop image file"
        >
            <WatermarkToolCore fileUploaderProps={fileUploaderProps} />
        </FileDropzone>
    );
}
