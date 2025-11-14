"use client";

import Thread from "@/components/assistant-ui/Thread";

import {MyRuntimeProvider} from "@/app/MyRuntimeProvider";

export default function Home() {
    return (
        <MyRuntimeProvider>
            <main
                className="h-dvh grid gap-x-2 px-4 py-4 grid-cols-1">
                <Thread />
            </main>
        </MyRuntimeProvider>
    );
}
