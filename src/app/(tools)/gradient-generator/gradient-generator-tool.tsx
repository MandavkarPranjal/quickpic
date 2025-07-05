"use client";

import { usePlausible } from "next-plausible";
import { useEffect, useState, useRef } from "react";

const GRADIENT_DIRECTIONS = [
    { label: "Sunset", value: "to bottom" },
    { label: "Aurora", value: "to right" },
    { label: "Waterfall", value: "to bottom right" },
    { label: "Mountain Peak", value: "to bottom left" },
    { label: "Cosmic Radial", value: "radial" },
    { label: "Ocean Wave", value: "to top" },
    { label: "Forest Light", value: "to left" },
    { label: "Diamond Sparkle", value: "radial-center" },
    { label: "Crystal Formation", value: "45deg" },
    { label: "Lightning Strike", value: "135deg" },
];

export function GradientGeneratorTool() {
    const [colors, setColors] = useState([{ id: 1, color: "#ff6b6b" }]);
    const [direction, setDirection] = useState("to right");
    const [noiseLevel, setNoiseLevel] = useState(0);
    const [blurLevel, setBlurLevel] = useState(0);
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);

    const addColor = () => {
        if (colors.length < 3) {
            const newId = Math.max(...colors.map(c => c.id)) + 1;
            setColors([...colors, { id: newId, color: "#4ecdc4" }]);
        }
    };

    const removeColor = (id: number) => {
        if (colors.length > 1) {
            setColors(colors.filter(c => c.id !== id));
        }
    };

    const updateColor = (id: number, newColor: string) => {
        setColors(colors.map(c => c.id === id ? { ...c, color: newColor } : c));
    };

    const generateGradient = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = width;
        canvas.height = height;

        let gradient;
        if (direction === "radial" || direction === "radial-center") {
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 2;
            gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        } else {
            const coords = getLinearGradientCoords(direction, width, height);
            gradient = ctx.createLinearGradient(coords.x1, coords.y1, coords.x2, coords.y2);
        }

        gradient.addColorStop(0, colors[0]?.color || "#ff6b6b");
        if (colors.length > 1) {
            gradient.addColorStop(1, colors[1]?.color || "#4ecdc4");
            if (colors.length > 2) {
                gradient.addColorStop(0.5, colors[2]?.color || "#8e44ad");
            }
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add noise if specified
        if (noiseLevel > 0) {
            addNoise(ctx, width, height, noiseLevel);
        }

        // Add blur if specified
        if (blurLevel > 0) {
            ctx.filter = `blur(${blurLevel}px)`;
            const imageData = ctx.getImageData(0, 0, width, height);
            ctx.filter = "none";
            ctx.putImageData(imageData, 0, 0);
        }

        // Update preview
        updatePreview();
    };

    const getLinearGradientCoords = (direction: string, w: number, h: number) => {
        switch (direction) {
            case "to bottom":
                return { x1: 0, y1: 0, x2: 0, y2: h };
            case "to top":
                return { x1: 0, y1: h, x2: 0, y2: 0 };
            case "to right":
                return { x1: 0, y1: 0, x2: w, y2: 0 };
            case "to left":
                return { x1: w, y1: 0, x2: 0, y2: 0 };
            case "to bottom right":
                return { x1: 0, y1: 0, x2: w, y2: h };
            case "to bottom left":
                return { x1: w, y1: 0, x2: 0, y2: h };
            case "45deg":
                return { x1: 0, y1: h, x2: w, y2: 0 };
            case "135deg":
                return { x1: 0, y1: 0, x2: w, y2: h };
            default:
                return { x1: 0, y1: 0, x2: w, y2: 0 };
        }
    };

    const addNoise = (ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) => {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity * 2;
            data[i] = Math.max(0, Math.min(255, data[i]! + noise));     // Red
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1]! + noise)); // Green
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2]! + noise)); // Blue
        }

        ctx.putImageData(imageData, 0, 0);
    };

    const updatePreview = () => {
        const canvas = canvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!canvas || !previewCanvas) return;

        const previewCtx = previewCanvas.getContext("2d");
        if (!previewCtx) return;

        // Set preview canvas size (scaled down)
        const maxPreviewSize = 300;
        const scale = Math.min(maxPreviewSize / width, maxPreviewSize / height);
        previewCanvas.width = width * scale;
        previewCanvas.height = height * scale;

        previewCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
    };

    const downloadGradient = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement("a");
        link.download = `gradient-${width}x${height}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    const plausible = usePlausible();

    useEffect(() => {
        generateGradient();
    }, [colors, direction, noiseLevel, blurLevel, width, height]);

    return (
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 p-6">
            <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
                <div className="flex justify-center">
                    <canvas
                        ref={previewCanvasRef}
                        className="border border-white/20 rounded max-w-full h-auto"
                    />
                </div>
                <p className="text-lg font-medium text-white/80">
                    Gradient Preview
                </p>
            </div>

            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-white/80">
                        Colors
                    </label>
                    <button
                        onClick={addColor}
                        disabled={colors.length >= 3}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
                    >
                        +
                    </button>
                </div>
                <div className="flex flex-wrap gap-3 mb-6">
                    {colors.map((colorItem) => (
                        <div key={colorItem.id} className="flex gap-2 items-center">
                            <input
                                type="color"
                                value={colorItem.color}
                                onChange={(e) => updateColor(colorItem.id, e.target.value)}
                                className="w-12 h-12 rounded border border-white/20"
                            />
                            <input
                                type="text"
                                value={colorItem.color}
                                onChange={(e) => updateColor(colorItem.id, e.target.value)}
                                className="w-20 bg-white/10 border border-white/20 rounded px-2 py-2 text-white text-sm"
                            />
                            {colors.length > 1 && (
                                <button
                                    onClick={() => removeColor(colorItem.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-2xl">
                <label className="block text-sm font-medium text-white/80 mb-4">
                    Direction
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {GRADIENT_DIRECTIONS.map(dir => (
                        <button
                            key={dir.value}
                            onClick={() => setDirection(dir.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center ${
                                direction === dir.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-white/10 text-white/80 hover:bg-white/20"
                            }`}
                        >
                            {dir.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Width: {width}px
                        </label>
                        <input
                            type="range"
                            min="200"
                            max="2000"
                            step="50"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mb-2"
                        />
                        <div className="flex justify-between text-xs text-white/60">
                            <span>200px</span>
                            <span>2000px</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Height: {height}px
                        </label>
                        <input
                            type="range"
                            min="200"
                            max="2000"
                            step="50"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mb-2"
                        />
                        <div className="flex justify-between text-xs text-white/60">
                            <span>200px</span>
                            <span>2000px</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Noise Level: {noiseLevel}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            step="1"
                            value={noiseLevel}
                            onChange={(e) => setNoiseLevel(Number(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mb-2"
                        />
                        <div className="flex justify-between text-xs text-white/60">
                            <span>0</span>
                            <span>50</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Blur Level: {blurLevel}px
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={blurLevel}
                            onChange={(e) => setBlurLevel(Number(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mb-2"
                        />
                        <div className="flex justify-between text-xs text-white/60">
                            <span>0px</span>
                            <span>20px</span>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => {
                    plausible("gradient-generator");
                    downloadGradient();
                }}
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
            >
                Download Gradient
            </button>

            {/* Hidden canvas for full-size generation */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}