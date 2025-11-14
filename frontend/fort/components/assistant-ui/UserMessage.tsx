import {MessagePrimitive} from "@assistant-ui/react";

export default function UserMessage() {
    return (
        <MessagePrimitive.Root className="grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 [&:where(>*)]:col-start-2 w-full max-w-[var(--thread-max-width)] py-4">
            <div className="bg-muted text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5 col-start-2 row-start-2">
                <MessagePrimitive.Content/>
            </div>
        </MessagePrimitive.Root>
    );
};
