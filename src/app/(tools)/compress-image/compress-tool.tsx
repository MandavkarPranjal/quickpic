"use client";

import { usePlausible } from "next-plausible";
import { UploadBox } from "@/components/shared/upload-box";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
    type FileUploaderResult,
    useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression"; // Updated import

function CompressToolCore(props: { fileUploaderProps: FileUploaderResult }) {
    const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
        props.fileUploaderProps;

    const [compressedImageContent, setCompressedImageContent] = useState<string | null>(null);

    useEffect(() => {
        if (imageContent && imageMetadata) {
            const image = new Image();
            image.onload = async () => {
                try {
                    const blob = await fetch(imageContent).then((res) => res.blob());
                    const file = new File([blob], imageMetadata.name, { type: blob.type }); // Convert Blob to File
                    const options = {
                        maxSizeMB: 1, // Target size in MB
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                        initialQuality: 0.7,
                    };
                    const compressedFile = await imageCompression(file, options);
                    const compressedImage = await imageCompression.getDataUrlFromFile(compressedFile);
                    setCompressedImageContent(compressedImage);
                } catch (err) {
                    console.error("Compression failed", err);
                }
            };
            image.src = imageContent;
        }
    }, [imageContent, imageMetadata]);

    const handleSaveCompressedImage = () => {
        if (compressedImageContent && imageMetadata) {
            const link = document.createElement("a");
            link.href = compressedImageContent;
            const originalFileName = imageMetadata.name;
            const fileNameWithoutExtension =
                originalFileName.substring(0, originalFileName.lastIndexOf(".")) || originalFileName;
            link.download = `${fileNameWithoutExtension}-compressed.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const plausible = usePlausible();

    if (!imageMetadata) {
        return (
            <UploadBox
                title="Compress images to reduce file size. Fast and free."
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
                {compressedImageContent && (
                    <img src={compressedImageContent} alt="Preview" className="mb-4" />
                )}
                <p className="text-lg font-medium text-white/80">
                    {imageMetadata.name}
                </p>
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
                        plausible("compress-image");
                        handleSaveCompressedImage();
                    }}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                >
                    Save Compressed Image
                </button>
            </div>
        </div>
    );
}

export function CompressTool() {
    const fileUploaderProps = useFileUploader();

    return (
        <FileDropzone
            setCurrentFile={fileUploaderProps.handleFileUpload}
            acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
            dropText="Drop image file"
        >
            <CompressToolCore fileUploaderProps={fileUploaderProps} />
        </FileDropzone>
    );
}
