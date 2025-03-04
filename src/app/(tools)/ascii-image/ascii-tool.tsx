"use client";

import { usePlausible } from "next-plausible";
import { UploadBox } from "@/components/shared/upload-box";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
    type FileUploaderResult,
    useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState, useRef } from "react";

function ASCIIArtToolCore(props: { fileUploaderProps: FileUploaderResult }) {
    const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
        props.fileUploaderProps;

    const [asciiArt, setAsciiArt] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [charDensity, setCharDensity] = useState(0.1); // Adjust for density
    const [charSet, setCharSet] = useState(" .:-=+*#%@"); // Change characters

    useEffect(() => {
        if (imageContent && imageMetadata) {
            const image = new Image();
            image.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;

                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                let ascii = "";
                for (let y = 0; y < canvas.height; y += 2) { // Adjust step for aspect ratio
                    for (let x = 0; x < canvas.width; x++) {
                        const red = data[(y * canvas.width + x) * 4];
                        const green = data[(y * canvas.width + x) * 4 + 1];
                        const blue = data[(y * canvas.width + x) * 4 + 2];
                        const brightness = (red + green + blue) / 3;

                        const charIndex = Math.floor((brightness / 255) * (charSet.length - 1));
                        ascii += charSet[charIndex];
                    }
                    ascii += "\n";
                }
                setAsciiArt(ascii);
            };
            image.src = imageContent;
        }
    }, [imageContent, imageMetadata, charDensity, charSet]);

    const handleSaveASCIIArt = () => {
        if (asciiArt && imageMetadata) {
            const blob = new Blob([asciiArt], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const originalFileName = imageMetadata.name;
            const fileNameWithoutExtension =
                originalFileName.substring(0, originalFileName.lastIndexOf(".")) || originalFileName;
            link.download = `${fileNameWithoutExtension}-ascii.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const plausible = usePlausible();

    if (!imageMetadata) {
        return (
            <UploadBox
                title="Convert images to ASCII art."
                subtitle="Creates text-based art."
                description="Upload Image"
                accept="image/*"
                onChange={handleFileUploadEvent}
            />
        );
    }

    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
            <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
                <canvas ref={canvasRef} style={{ display: "none" }} />
                {asciiArt && (
                    <pre className="whitespace-pre-wrap font-mono text-sm">{asciiArt}</pre>
                )}
                <p className="text-lg font-medium text-white/80">
                    {imageMetadata.name}
                </p>
                <div className="flex gap-2">
                    <label htmlFor="density">Density:</label>
                    <input
                        type="range"
                        id="density"
                        min="0.05"
                        max="0.5"
                        step="0.05"
                        value={charDensity}
                        onChange={(e) => setCharDensity(parseFloat(e.target.value))}
                    />
                </div>
                <div className="flex gap-2">
                    <label htmlFor="charset">Charset:</label>
                    <input
                        type="text"
                        id="charset"
                        value={charSet}
                        className="text-black"
                        onChange={(e) => setCharSet(e.target.value)}
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
                        plausible("ascii-art");
                        handleSaveASCIIArt();
                    }}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                >
                    Save ASCII Art
                </button>
            </div>
        </div>
    );
}

export function ASCIIArtTool() {
    const fileUploaderProps = useFileUploader();

    return (
        <FileDropzone
            setCurrentFile={fileUploaderProps.handleFileUpload}
            acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
            dropText="Drop image file"
        >
            <ASCIIArtToolCore fileUploaderProps={fileUploaderProps} />
        </FileDropzone>
    );
}
