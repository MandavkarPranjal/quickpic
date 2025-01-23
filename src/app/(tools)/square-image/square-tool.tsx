"use client";

import { usePlausible } from "next-plausible";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UploadBox } from "@/components/shared/upload-box";
import { OptionSelector } from "@/components/shared/option-selector";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
    type FileUploaderResult,
    useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState, useCallback } from "react";

type BackgroundColor = "black" | "white" | "detected";

function SquareToolCore(props: { fileUploaderProps: FileUploaderResult }) {
    const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
        props.fileUploaderProps;

    const [detectedColor, setDetectedColor] = useState<string>("#FFFFFF");
    const [backgroundColor, setBackgroundColor] = useLocalStorage<BackgroundColor>(
        "squareTool_backgroundColor",
        "detected"
    );

    const [squareImageContent, setSquareImageContent] = useState<string | null>(
        null,
    );

    // Memoize the square image generation to prevent unnecessary recalculations
    const generateSquareImage = useCallback(
        (img: HTMLImageElement, bgColor: string) => {
            if (!imageMetadata) return;

            const canvas = document.createElement("canvas");
            const size = Math.max(imageMetadata.width, imageMetadata.height);
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, size, size);

            const x = (size - imageMetadata.width) / 2;
            const y = (size - imageMetadata.height) / 2;
            ctx.drawImage(img, x, y);

            setSquareImageContent(canvas.toDataURL("image/png"));
        },
        [imageMetadata],
    );

    useEffect(() => {
        if (imageContent && imageMetadata) {
            const img = new Image();
            img.onload = () => {
                const bgColor =
                    backgroundColor === "detected"
                        ? detectedColor
                        : backgroundColor;
                generateSquareImage(img, bgColor);
            };
            img.src = imageContent;
        }
    }, [imageContent, imageMetadata, backgroundColor, detectedColor, generateSquareImage]);

    const detectEdgeColor = useCallback((img: HTMLImageElement) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const edgePixels: string[] = [];
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Sampling edge pixels
        for (let i = 0; i < canvas.width; i++) {
            // Top edge
            const topIdx = (i + 0 * canvas.width) * 4;
            edgePixels.push(
                `#${data[topIdx].toString(16).padStart(2, "0")}${data[topIdx + 1]
                    .toString(16)
                    .padStart(2, "0")}${data[topIdx + 2].toString(16).padStart(2, "0")}`,
            );

            // Bottom edge
            const bottomIdx = (i + (canvas.height - 1) * canvas.width) * 4;
            edgePixels.push(
                `#${data[bottomIdx].toString(16).padStart(2, "0")}${data[bottomIdx + 1]
                    .toString(16)
                    .padStart(2, "0")}${data[bottomIdx + 2]
                        .toString(16)
                        .padStart(2, "0")}`,
            );
        }

        for (let i = 0; i < canvas.height; i++) {
            // Left edge
            const leftIdx = (0 + i * canvas.width) * 4;
            edgePixels.push(
                `#${data[leftIdx].toString(16).padStart(2, "0")}${data[leftIdx + 1]
                    .toString(16)
                    .padStart(2, "0")}${data[leftIdx + 2].toString(16).padStart(2, "0")}`,
            );

            // Right edge
            const rightIdx = (canvas.width - 1 + i * canvas.width) * 4;
            edgePixels.push(
                `#${data[rightIdx].toString(16).padStart(2, "0")}${data[rightIdx + 1]
                    .toString(16)
                    .padStart(2, "0")}${data[rightIdx + 2]
                        .toString(16)
                        .padStart(2, "0")}`,
            );
        }

        const colorCount = edgePixels.reduce(
            (acc: Record<string, number>, color) => {
                acc[color] = (acc[color] || 0) + 1;
                return acc;
            },
            {},
        );

        const mostCommonColor = Object.entries(colorCount).reduce(
            (a, b) => (a[1] > b[1] ? a : b),
            ["#FFFFFF", 0],
        )[0];
        setDetectedColor(mostCommonColor);
    }, []);

    useEffect(() => {
        if (imageContent) {
            const img = new Image();
            img.onload = () => detectEdgeColor(img);
            img.src = imageContent;
        }
    }, [imageContent, detectEdgeColor]);

    const handleSaveImage = useCallback(() => {
        if (squareImageContent && imageMetadata) {
            const link = document.createElement("a");
            link.href = squareImageContent;
            const originalFileName = imageMetadata.name;
            const fileNameWithoutExtension =
                originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
                originalFileName;
            link.download = `${fileNameWithoutExtension}-squared.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [squareImageContent, imageMetadata]);

    const plausible = usePlausible();

    if (!imageMetadata) {
        return (
            <UploadBox
                title="Create square images with custom backgrounds. Fast and free."
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
                {squareImageContent && (
                    <img
                        src={squareImageContent}
                        alt="Squared preview"
                        className="mb-4"
                    />
                )}
                <p className="text-lg font-medium text-white/80">
                    {imageMetadata.name}
                </p>
            </div>

            <div className="flex gap-6 text-base">
                <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
                    <span className="text-sm text-white/60">Original</span>
                    <span className="font-medium text-white">
                        {imageMetadata.width} × {imageMetadata.height}
                    </span>
                </div>

                <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
                    <span className="text-sm text-white/60">Square Size</span>
                    <span className="font-medium text-white">
                        {Math.max(imageMetadata.width, imageMetadata.height)} ×{" "}
                        {Math.max(imageMetadata.width, imageMetadata.height)}
                    </span>
                </div>
            </div>

            <OptionSelector<BackgroundColor>
                title="Background Color"
                options={["detected", "white", "black"]}
                selected={backgroundColor}
                onChange={setBackgroundColor}
                formatOption={(option) =>
                    option === "detected"
                        ? "Detected Color"
                        : option.charAt(0).toUpperCase() + option.slice(1)
                }
            />

            <div className="flex gap-3">
                <button
                    onClick={cancel}
                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        plausible("create-square-image");
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

export function SquareTool() {
    const fileUploaderProps = useFileUploader();

    return (
        <FileDropzone
            setCurrentFile={fileUploaderProps.handleFileUpload}
            acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
            dropText="Drop image file"
        >
            <SquareToolCore fileUploaderProps={fileUploaderProps} />
        </FileDropzone>
    );
}
