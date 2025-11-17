import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter';
import {Toaster} from "sonner";
import {ReactNode} from "react";

import {MyRuntimeProvider} from "@/app/MyRuntimeProvider";

import "./globals.css";

type PropsType = {
    children: ReactNode
}

export default function RootLayout(props: PropsType) {
    return (
        <MyRuntimeProvider>
            <html lang="ru">
            <head>
                <title>Brainwave</title>
            </head>
            <body>
            <AppRouterCacheProvider>
                {props.children}
                <Toaster position="top-right" richColors/>
            </AppRouterCacheProvider>
            </body>
            </html>
        </MyRuntimeProvider>
    );
}
