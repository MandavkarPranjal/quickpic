import { GenerateImage } from "@/app/utils/og-generator";

export const runtime = "edge";

export const alt = "SVG ➡️ PNG - QuickPic";
export const contentType = "image/png";

export const size = {
    width: 1200,
    height: 630,
};

// Image generation
export default async function Image() {
    return await GenerateImage({
        title: "Watermark Image",
        description: "The only sane way to add watermark to image.",
    });
}
