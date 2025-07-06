"use client";

import { usePlausible } from "next-plausible";
import { UploadBox } from "@/components/shared/upload-box";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
    type FileUploaderResult,
    useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";

// Standard ICO sizes
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

function IcoGeneratorToolCore(props: { fileUploaderProps: FileUploaderResult }) {
    const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
        props.fileUploaderProps;

    const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48]);
    const [previewImages, setPreviewImages] = useState<Record<number, string>>({});

    useEffect(() => {
        if (imageContent && imageMetadata) {
            const image = new Image();
            image.onload = () => {
                const previews: Record<number, string> = {};

                selectedSizes.forEach(size => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if (!ctx) return;

                    canvas.width = size;
                    canvas.height = size;

                    // Fill with transparent background
                    ctx.clearRect(0, 0, size, size);

                    // Draw the image scaled to fit the square
                    const scale = Math.min(size / image.width, size / image.height);
                    const scaledWidth = image.width * scale;
                    const scaledHeight = image.height * scale;
                    const x = (size - scaledWidth) / 2;
                    const y = (size - scaledHeight) / 2;

                    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

                    previews[size] = canvas.toDataURL("image/png");
                });

                setPreviewImages(previews);
            };
            image.src = imageContent;
        }
    }, [imageContent, imageMetadata, selectedSizes]);

    const toggleSize = (size: number) => {
        setSelectedSizes(prev =>
            prev.includes(size)
                ? prev.filter(s => s !== size)
                : [...prev, size].sort((a, b) => a - b)
        );
    };

    const canvasToIco = (canvas: HTMLCanvasElement): Promise<Blob> => {
        return new Promise((resolve) => {
            canvas.toBlob((pngBlob) => {
                if (!pngBlob) {
                    resolve(new Blob());
                    return;
                }

                // Convert PNG to ICO format
                const reader = new FileReader();
                reader.onload = () => {
                    const pngData = new Uint8Array(reader.result as ArrayBuffer);
                    const icoData = createIcoFromPng(pngData, canvas.width);
                    resolve(new Blob([icoData], { type: 'image/x-icon' }));
                };
                reader.readAsArrayBuffer(pngBlob);
            }, "image/png");
        });
    };

    const createIcoFromPng = (pngData: Uint8Array, size: number): Uint8Array => {
        // ICO file header (6 bytes)
        const header = new Uint8Array([
            0x00, 0x00, // Reserved (must be 0)
            0x01, 0x00, // Type (1 = ICO)
            0x01, 0x00  // Number of images (1)
        ]);

        // ICO directory entry (16 bytes)
        const sizeBytes = size === 256 ? 0 : size; // 256 is represented as 0 in ICO
        const directory = new Uint8Array([
            sizeBytes,    // Width
            sizeBytes,    // Height  
            0x00,         // Color palette (0 = no palette)
            0x00,         // Reserved
            0x01, 0x00,   // Color planes (1)
            0x20, 0x00,   // Bits per pixel (32)
            ...new Uint8Array(new Uint32Array([pngData.length]).buffer), // Size of PNG data (little endian)
            ...new Uint8Array(new Uint32Array([22]).buffer) // Offset to PNG data (little endian)
        ]);

        // Combine header + directory + PNG data
        const ico = new Uint8Array(header.length + directory.length + pngData.length);
        ico.set(header, 0);
        ico.set(directory, header.length);
        ico.set(pngData, header.length + directory.length);

        return ico;
    };

    const generateFavicon = async () => {
        if (!imageContent || !imageMetadata || selectedSizes.length === 0) return;

        const image = new Image();
        image.onload = async () => {
            const originalFileName = imageMetadata.name;
            const fileNameWithoutExtension =
                originalFileName.substring(0, originalFileName.lastIndexOf(".")) || originalFileName;

            if (selectedSizes.length === 1) {
                // Single dimension: download as .ico
                const size = selectedSizes[0]!;
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) return;

                canvas.width = size;
                canvas.height = size;
                ctx.clearRect(0, 0, size, size);

                const scale = Math.min(size / image.width, size / image.height);
                const scaledWidth = image.width * scale;
                const scaledHeight = image.height * scale;
                const x = (size - scaledWidth) / 2;
                const y = (size - scaledHeight) / 2;

                ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

                const blob = await canvasToIco(canvas);
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${fileNameWithoutExtension}-${size}x${size}.ico`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } else {
                // Multiple dimensions: download as .zip
                const JSZip = (await import("jszip")).default;
                const zip = new JSZip();

                for (const size of selectedSizes) {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if (!ctx) continue;

                    canvas.width = size;
                    canvas.height = size;
                    ctx.clearRect(0, 0, size, size);

                    const scale = Math.min(size / image.width, size / image.height);
                    const scaledWidth = image.width * scale;
                    const scaledHeight = image.height * scale;
                    const x = (size - scaledWidth) / 2;
                    const y = (size - scaledHeight) / 2;

                    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

                    const blob = await canvasToIco(canvas);
                    zip.file(`${fileNameWithoutExtension}-${size}x${size}.ico`, blob);
                }

                const zipBlob = await zip.generateAsync({ type: "blob" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(zipBlob);
                link.download = `${fileNameWithoutExtension}-favicons.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }
        };
        image.src = imageContent;
    };

    const plausible = usePlausible();

    if (!imageMetadata) {
        return (
            <UploadBox
                title="Generate favicon files from any image. Fast and free."
                subtitle="Allows pasting images from clipboard"
                description="Upload Image"
                accept="image/*"
                onChange={handleFileUploadEvent}
            />
        );
    }

    return (
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 p-6">
            <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
                <p className="text-lg font-medium text-white/80">
                    {imageMetadata.name}
                </p>
            </div>

            <div className="w-full max-w-2xl">
                <h3 className="text-lg font-medium text-white/80 mb-4 text-center">
                    Select Favicon Sizes
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {ICO_SIZES.map(size => (
                        <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSizes.includes(size)
                                ? "bg-blue-600 text-white"
                                : "bg-white/10 text-white/80 hover:bg-white/20"
                                }`}
                        >
                            {size}×{size}
                        </button>
                    ))}
                </div>

                {selectedSizes.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-md font-medium text-white/80 mb-3 text-center">
                            Preview
                        </h4>
                        <div className="flex flex-wrap justify-center gap-4">
                            {selectedSizes.map(size => (
                                previewImages[size] && (
                                    <div key={size} className="flex flex-col items-center gap-2">
                                        <img
                                            src={previewImages[size]}
                                            alt={`${size}x${size} preview`}
                                            className="border border-white/20 rounded"
                                            style={{ width: Math.min(size, 64), height: Math.min(size, 64) }}
                                        />
                                        <span className="text-xs text-white/60">{size}×{size}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={cancel}
                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
                >
                    Cancel
                </button>
                <button
                    onClick={async () => {
                        plausible("ico-generator");
                        await generateFavicon();
                    }}
                    disabled={selectedSizes.length === 0}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Generate Favicon
                </button>
            </div>
        </div>
    );
}

export function IcoGeneratorTool() {
    const fileUploaderProps = useFileUploader();

    return (
        <FileDropzone
            setCurrentFile={fileUploaderProps.handleFileUpload}
            acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
            dropText="Drop image file"
        >
            <IcoGeneratorToolCore fileUploaderProps={fileUploaderProps} />
        </FileDropzone>
    );
}
