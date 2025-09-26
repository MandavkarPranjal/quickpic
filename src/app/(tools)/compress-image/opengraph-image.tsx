import { GenerateImage } from "@/app/utils/og-generator";

export const runtime = "edge";

export const alt = "Ascii Image - QuickPic";
export const contentType = "image/png";

export const size = {
    width: 1200,
    height: 630,
};

// Image generation
export default async function Image() {
    return await GenerateImage({
        title: "Compress Image",
        description: "Reduce image size fast and free.",
    });
}
