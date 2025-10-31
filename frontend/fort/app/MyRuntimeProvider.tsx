"use client";

import type {ReactNode} from "react";
import {
    AssistantRuntimeProvider,
    useLocalRuntime,
    type ChatModelAdapter,
} from "@assistant-ui/react";

const MyModelAdapter: ChatModelAdapter = {
    async run({messages, abortSignal}) {
        const lastMessage = messages.at(-1);

        const textPart = lastMessage?.content.find(
            (part) => part.type === "text"
        ) as { type: "text"; text: string } | undefined;

        const rawText = textPart?.text ?? "";
        if (!rawText) throw new Error("User message text is missing.");

        return new Promise(resolve => resolve)
    },
};

export function MyRuntimeProvider({
                                      children,
                                  }: Readonly<{
    children: ReactNode;
}>) {
    const runtime = useLocalRuntime(MyModelAdapter);

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            {children}
        </AssistantRuntimeProvider>
    );
}

