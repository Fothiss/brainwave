import {MessagePrimitive, useMessage} from "@assistant-ui/react";

import {MarkdownText} from "@/components/assistant-ui/markdown-text";
import {FeedbackBlock} from "@/components/ui/FeedbackBlock";
import AssistantActionBar from "@/components/assistant-ui/AssistantActionBar";
import {downloadPdf} from "@/app/utils/downloadPdf";

export default function AssistantMessage() {
    const message = useMessage();
    const custom = message.metadata.custom as { log_id: number } | undefined;

    return (
        <MessagePrimitive.Root className="grid grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-[var(--thread-max-width)] py-4">
            <div className="text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7 col-span-2 col-start-2 row-start-1 my-1.5 flex-wrap">
                <div id={message.id}>
                    <MessagePrimitive.Content components={{Text: MarkdownText}}/>
                </div>

                {
                    custom?.log_id && (
                        <FeedbackBlock logId={custom.log_id}/>
                    )
                }
            </div>

            <AssistantActionBar onSave={() => downloadPdf(message.id)}/>
        </MessagePrimitive.Root>
    );
};
