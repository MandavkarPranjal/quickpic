import { GenerateImage } from "@/app/utils/og-generator";

export const runtime = "edge";

export const alt = "Compress Image - QuickPic";
export const contentType = "image/png";

export const size = {
    width: 1200,
    height: 630,
};

// Image generation
export default async function Image() {
    return await GenerateImage({
        title: "Compress Image",
        description: "Compress images to reduce file size. Fast and free.",
    });
}
