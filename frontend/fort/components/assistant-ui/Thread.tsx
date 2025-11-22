import {ThreadPrimitive} from "@assistant-ui/react";

import AssistantMessage from "@/components/assistant-ui/AssistantMessage";
import ThreadWelcome from "@/components/assistant-ui/ThreadWelcome";
import UserMessage from "@/components/assistant-ui/UserMessage";
import Composer from "@/components/ui/Composer";
import ThreadScrollToBottom from "@/components/assistant-ui/ThreadScrollToBottom";

export default function Thread() {
    return (
        <ThreadPrimitive.Root
            className="bg-background box-border h-full flex flex-col overflow-hidden"
            style={{["--thread-max-width" as string]: "42rem"}}
        >
            <ThreadPrimitive.Viewport
                className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-0"
                autoScroll={false}
            >
                <div className="sticky top-0 mt-0 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-start rounded-b-lg bg-background pt-1 pb-1 z-20">
                    <Composer/>
                </div>

                <ThreadWelcome/>

                <ThreadPrimitive.Messages
                    components={{
                        UserMessage: UserMessage,
                        AssistantMessage: AssistantMessage
                    }}
                />

                <ThreadPrimitive.If empty={false}>
                    <div className="min-h-8 flex-grow"/>
                </ThreadPrimitive.If>

                <ThreadScrollToBottom/>
            </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
    );
};
