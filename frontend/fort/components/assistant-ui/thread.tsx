import {BranchPickerPrimitive, MessagePrimitive, ThreadPrimitive, useThreadRuntime} from "@assistant-ui/react";
import {FC, SyntheticEvent, useEffect, useState} from "react";
import {ArrowDownIcon, ChevronLeftIcon, ChevronRightIcon, GlobeIcon} from "lucide-react";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {ThreadBackgroundMessage} from "@/lib/messages";
import {Button} from "@/components/ui/button";
import {TooltipIconButton} from "@/components/assistant-ui/tooltip-icon-button";
import {useOperationRefs} from "@/app/hooks/useOperationRefs";
import {Autocomplete, CircularProgress, TextField, IconButton} from "@mui/material";
import {Send} from "@mui/icons-material"
import {OperationRef} from "@/app/models/operationRef";
import {Participants} from "@/app/models/participants";
import AssistantMessage from "@/components/assistant-ui/AssistantMessage";
import {CreateAppendMessage} from "@assistant-ui/react";


const GenerateConfluence: FC = () => {
    const [loading, setLoading] = useState(false);
    const [pageUrl, setPageUrl] = useState<string | null>(null);
    const [html, setHtml] = useState<string | null>(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const createPage = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
            const payload = {
                token,
                confluence_url: process.env.NEXT_PUBLIC_CONFLUENCE_URL,
                confluence_username: process.env.NEXT_PUBLIC_CONFLUENCE_USER,
                confluence_api_token: process.env.NEXT_PUBLIC_CONFLUENCE_API_TOKEN,
                confluence_space_key: process.env.NEXT_PUBLIC_CONFLUENCE_SPACE,
            };

            const res = await fetch(`${backend}/api/v1/create-confluence-tz/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Не удалось создать страницу");
            const {page_url, html: rawHtml} = await res.json();

            setPageUrl(page_url);
            setHtml(rawHtml);
            toast.success("Страница Confluence создана!");
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[var(--thread-max-width)] flex flex-col items-center gap-4 py-6">
            {!pageUrl && (
                <Button onClick={createPage} disabled={loading}>
                    {loading ? "Создание…" : "Сгенерировать страницу Confluence"}
                </Button>
            )}
            {html && (
                <div
                    className="prose max-h-96 w-full overflow-auto rounded-lg border p-4"
                    dangerouslySetInnerHTML={{__html: html}}
                />
            )}

            {pageUrl && (
                <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shadow"
                >
                    <GlobeIcon size={16}/>
                    Открыть в Confluence
                </a>
            )}

        </div>
    );
};

export const Thread: FC<{ stageIndex: number }> = ({stageIndex}) => {
    return (
        <ThreadPrimitive.Root
            className="bg-background box-border h-full flex flex-col overflow-hidden"
            style={{
                ["--thread-max-width" as string]: "42rem",
            }}
        >
            <ThreadPrimitive.Viewport
                className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
                <ThreadWelcome stageIndex={stageIndex}/>

                <ThreadPrimitive.Messages
                    components={{
                        UserMessage: UserMessage,
                        AssistantMessage: AssistantMessage,
                    }}
                />

                <ThreadPrimitive.If empty={false}>
                    <div className="min-h-8 flex-grow"/>
                </ThreadPrimitive.If>

                {stageIndex < 5 && (
                    <div
                        className="sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
                        <ThreadScrollToBottom/>
                        <Composer/>
                    </div>
                )}

                {stageIndex === 5 && <GenerateConfluence/>}
            </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
    );
};

const ThreadScrollToBottom: FC = () => {
    return (
        <ThreadPrimitive.ScrollToBottom asChild>
            <TooltipIconButton
                tooltip="Scroll to bottom"
                variant="outline"
                className="absolute -top-8 rounded-full disabled:invisible"
            >
                <ArrowDownIcon/>
            </TooltipIconButton>
        </ThreadPrimitive.ScrollToBottom>
    );
};

const ThreadWelcome: FC<{ stageIndex: number }> = ({stageIndex}) => {
    return (
        <ThreadPrimitive.Empty>
            <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
                <div className="flex w-full flex-grow flex-col items-center justify-center">
                    {stageIndex === 4 ?
                        <p className="mt-4 font-medium whitespace-pre-line">{ThreadBackgroundMessage}</p>
                        : stageIndex != 5 && (<p className="mt-4 font-medium">Brainwave </p>)}
                </div>
                { /*<ThreadWelcomeSuggestions />*/}
            </div>
        </ThreadPrimitive.Empty>
    );
};


type CustomMetadata = {
    custom: {
        operation: OperationRef | null;
        participants: Participants[];
    };
};

type CustomAppendMessage = CreateAppendMessage & {
    metadata?: CustomMetadata;
};

const Composer = () => {
    const {operations, loading} = useOperationRefs();
    const runtime = useThreadRuntime();

    const [selected, setSelected] = useState<OperationRef | null>(null);
    const [participants, setParticipants] = useState<Participants[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = runtime.subscribe(() => {
            setIsLoading(runtime.getState().isRunning)
        })

        return () => unsubscribe()
    }, []);

    const sendMessage = () => {
        if (isLoading)
            return

        const message: CustomAppendMessage = {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `Операция: ${selected?.name}`
                }
            ],
            metadata: {
                custom: {
                    operation: selected,
                    participants
                }
            }
        };

        runtime.append(message);
    }

    const handleSelectChange = (_: SyntheticEvent, value: OperationRef | null) => {
        setSelected(value);
        setParticipants(Array.from({length: value?.participants ?? 0}, () => ({
            name: "",
            type: "Физическое лицо",
            isResident: "Да"
        })));
    };

    const updateParticipant = (index: number, key: "name" | "type" | "isResident", value: string) => {
        setParticipants(prev => {
            const updated = [...prev];
            updated[index] = {...updated[index], [key]: value};
            return updated;
        });
    };

    return (
        <div style={{width: "100%", display: "grid", gap: "10px"}}>
            <div style={{width: "100%", display: "flex", gap: "10px"}}>
                <Autocomplete
                    options={operations}
                    getOptionLabel={(option) => `${option.name}`}
                    loading={loading}
                    onChange={handleSelectChange}
                    filterSelectedOptions
                    fullWidth
                    sx={{flexGrow: 1}}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Выберите операцию"
                            variant="outlined"
                            size="medium"
                            slotProps={{
                                input: {
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress color="inherit" size={20}/> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    )
                                }
                            }}
                        />
                    )}
                />
                <IconButton aria-label="sent" onClick={sendMessage} style={{width: "56px"}}>
                    {
                        isLoading
                            ? <CircularProgress color="inherit" size={20}/>
                            : <Send/>
                    }
                </IconButton>
            </div>
            <div style={{width: "100%", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px"}}>
                {
                    participants.map((p, idx) => (
                        <div key={idx} style={{display: "flex", gap: "10px", width: "100%", alignItems: "center"}}>

                            <p style={{width: "150px"}}>Участник {idx + 1}</p>

                            <Autocomplete
                                options={["Физическое лицо", "Юридическое лицо"]}
                                value={p.type}
                                onChange={(_, value) => updateParticipant(idx, "type", value || "Физическое лицо")}
                                sx={{width: "100%"}}
                                renderInput={(params) => (
                                    <TextField {...params} label="Тип лица" variant="outlined"/>
                                )}
                            />

                            <Autocomplete
                                options={["Да", "Нет"]}
                                value={p.isResident}
                                onChange={(_, value) => updateParticipant(idx, "isResident", value || "Да")}
                                sx={{width: "290px"}}
                                renderInput={(params) => (
                                    <TextField {...params} label="Налоговый резидент РФ" variant="outlined"/>
                                )}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    );
};


const UserMessage: FC = () => {
    return (
        <MessagePrimitive.Root
            className="grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 [&:where(>*)]:col-start-2 w-full max-w-[var(--thread-max-width)] py-4">

            <div
                className="bg-muted text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5 col-start-2 row-start-2">
                <MessagePrimitive.Content/>
            </div>

            <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end"/>
        </MessagePrimitive.Root>
    );
};


const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({className, ...rest}) => {
    return (
        <BranchPickerPrimitive.Root
            hideWhenSingleBranch
            className={cn(
                "text-muted-foreground inline-flex items-center text-xs",
                className
            )}
            {...rest}
        >
            <BranchPickerPrimitive.Previous asChild>
                <TooltipIconButton tooltip="Previous">
                    <ChevronLeftIcon/>
                </TooltipIconButton>
            </BranchPickerPrimitive.Previous>
            <span className="font-medium">
        <BranchPickerPrimitive.Number/> / <BranchPickerPrimitive.Count/>
      </span>
            <BranchPickerPrimitive.Next asChild>
                <TooltipIconButton tooltip="Next">
                    <ChevronRightIcon/>
                </TooltipIconButton>
            </BranchPickerPrimitive.Next>
        </BranchPickerPrimitive.Root>
    );
};
