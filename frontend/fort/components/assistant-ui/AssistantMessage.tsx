import {useEffect, useState} from "react";
import {MessagePrimitive, useMessage, useThreadRuntime} from "@assistant-ui/react";
import {Autocomplete, CircularProgress, IconButton, TextField} from "@mui/material";
import {Send} from "@mui/icons-material";

import {MarkdownText} from "@/components/assistant-ui/MarkdownText";
import {FeedbackBlock} from "@/components/ui/FeedbackBlock";
import AssistantActionBar from "@/components/assistant-ui/AssistantActionBar";
import {downloadPdf} from "@/app/utils/downloadPdf";
import {Participants} from "@/app/models/participants";
import {CustomAppendMessageType} from "@/app/models/customAppendMessage";
import {OperationRef} from "@/app/models/operationRef";
import MessagePrimitivePartsGrouped from "@/components/assistant-ui/MessagePrimitivePartsGrouped";

type CustomType = {
    log_id: number;
    operation: OperationRef | undefined;
    participants: Participants[] | undefined;
    docs_data: string[][] | undefined;
}

export default function AssistantMessage() {
    const message = useMessage();
    const custom = message.metadata.custom as CustomType | undefined;
    const runtime = useThreadRuntime();

    const [currentDoc, setCurrentDoc] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = runtime.subscribe(() => {
            setIsLoading(runtime.getState().isRunning)
        })

        return () => unsubscribe()
    }, []);

    const sendMessage = () => {
        if (isLoading || !custom || !custom.docs_data)
            return

        const message: CustomAppendMessageType = {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `Документ основания: ${currentDoc}`
                }
            ],
            metadata: {
                custom: {
                    log_id: custom.log_id,
                    operation: custom.operation,
                    participants: custom.participants,
                    doc_id: Number(custom.docs_data.find(item => item[0] === currentDoc)?.[1])
                }
            }
        };

        runtime.append(message);
    }

    if (custom?.docs_data != undefined) {
        const docs = custom.docs_data.map(([name]) => name)

        return (
            <MessagePrimitive.Root className="grid grid-cols-1 gap-2 relative w-full max-w-[var(--thread-max-width)] py-4">
                <p className="pb-2">Выберите документ основания</p>

                <div className="flex items-center gap-2 w-full">
                    <Autocomplete
                        options={docs}
                        value={currentDoc ?? ""}
                        onChange={(_, value) => setCurrentDoc(value ?? undefined)}
                        sx={{width: "70%"}}
                        disabled={!message.isLast}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Документ основания"
                                variant="outlined"
                                size="small"
                            />
                        )}
                    />

                    {
                        message.isLast && (
                            <IconButton aria-label="sent" onClick={sendMessage}>
                                {
                                    isLoading
                                        ? <CircularProgress color="inherit" size={20}/>
                                        : <Send/>
                                }
                            </IconButton>
                        )
                    }
                </div>
            </MessagePrimitive.Root>

        )
    }

    return (
        <MessagePrimitive.Root className={`grid grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-[calc(var(--thread-max-width)${message.content.length > 1 ? "*1.5" : ""})] py-4`}>
            <div className={`text-foreground ${message.content.length <= 1 && "max-w-[calc(var(--thread-max-width)*0.8)]"} break-words leading-7 col-span-2 col-start-2 row-start-1 my-1.5 flex-wrap`}>
                <div id={message.id} style={{display: "flex", gap: 10}}>
                    {
                        message.content.length > 1
                            ? <MessagePrimitivePartsGrouped/>
                            : <MessagePrimitive.Content components={{Text: MarkdownText}}/>
                    }
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
