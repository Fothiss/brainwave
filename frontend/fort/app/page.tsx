"use client";

import {useState} from "react";
import {Thread} from "@/components/assistant-ui/thread";

import {MyRuntimeProvider} from "@/app/MyRuntimeProvider";

export default function Home() {
    const [stageIndex] = useState(0);

    return (
        <MyRuntimeProvider>
            <main
                className="h-dvh grid gap-x-2 px-4 py-4 grid-cols-1">
                <Thread stageIndex={stageIndex}/>
            </main>
        </MyRuntimeProvider>
    );
}
