import "./globals.css";
import {MyRuntimeProvider} from "@/app/MyRuntimeProvider";
import {Toaster} from "sonner";
import {ReactNode} from "react";
import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter';

export default function RootLayout({children}: Readonly<{ children: ReactNode; }>) {
    return (
        <MyRuntimeProvider>
            <html lang="en">
            <body>
            <AppRouterCacheProvider>
                {children}
                <Toaster position="top-right" richColors/>
            </AppRouterCacheProvider>
            </body>
            </html>
        </MyRuntimeProvider>
    );
}
