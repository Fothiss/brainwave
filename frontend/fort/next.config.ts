import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    devIndicators: {
        buildActivity: false
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    }
};

export default nextConfig;
