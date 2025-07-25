import Link from "next/link";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col justify-between p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
            <main className="flex flex-grow flex-col items-center justify-center text-center">
                <div>
                    Hi. I&apos;m{" "}
                    <a
                        href="https://x.com/__pr4njal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                    >
                        Pranjal
                    </a>
                    . I built these tools because I was annoyed they did not exist without signing in.<br />
                    <p className="text-center text-white/60">
                        I don&apos;t collect your data as cookies or anything. All work is done on your side.
                    </p>
                </div>
                <div className="mt-4"></div>
                <Link href="/gradient-generator" className="text-blue-500 hover:underline">
                    Gradient Generator
                </Link>
                <Link href="/ico-generator" className="text-blue-500 hover:underline">
                    ICO Generator
                </Link>
                <Link href="/png-to-jpg" className="text-blue-500 hover:underline">
                    PNG to JPG Converter
                </Link>
                <Link href="/svg-to-png" className="text-blue-500 hover:underline">
                    SVG to PNG converter
                </Link>
                <Link href="/square-image" className="text-blue-500 hover:underline">
                    Square image generator
                </Link>
                <Link href="/rounded-border" className="text-blue-500 hover:underline">
                    Corner Rounder
                </Link>
                <Link href="/compress-image" className="text-blue-500 hover:underline">
                    Compress Image
                </Link>
                <Link href="/noise-image" className="text-blue-500 hover:underline">
                    Noise Image
                </Link>
                <Link href="/watermark-image" className="text-blue-500 hover:underline">
                    Watermark generator
                </Link>
                <Link href="/ascii-image" className="text-blue-500 hover:underline">
                    ASCII Art generator
                </Link>
                <Link href="/blur-text" className="text-blue-500 hover:underline">
                    Blur Image with Text
                </Link>
            </main>
            <footer className="mt-8 text-center text-sm text-gray-500">
                <a
                    href="https://github.com/MandavkarPranjal/quickpic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                >
                    View on GitHub
                </a>
            </footer>
        </div>
    );
}
