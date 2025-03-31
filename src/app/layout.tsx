import "./globals.css";
import PlausibleProvider from "next-plausible";

export const metadata = {
    title: "QuickPic - Quick Image Tools",
    description: "Quick and easy image tools",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Limelight&family=UnifrakturMaguntia&family=Fascinate&family=Schoolbell&display=swap" rel="stylesheet" />
                <style>
                    {`
                    @font-face {
                        font-family: 'Sour Gummy';
                        src: url('https://fonts.cdnfonts.com/css/sour-gummy') format('woff2');
                    }
                    `}
                </style>
                <PlausibleProvider domain="quickpic.pranjal.me" />
            </head>
            <body>{children}</body>
        </html>
    );
}
