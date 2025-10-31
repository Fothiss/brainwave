import {
    ActionBarPrimitive,
    BranchPickerPrimitive,
    ComposerPrimitive,
    MessagePrimitive,
    ThreadPrimitive,
    useThreadRuntime,
} from "@assistant-ui/react";
import type {FC, SyntheticEvent} from "react";
import {useState} from "react";
import {
    ArrowDownIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CopyIcon,
    PencilIcon,
    RefreshCwIcon,
    SendHorizontalIcon,
    ImageIcon,
    GlobeIcon,
} from "lucide-react";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {ThreadBackgroundMessage} from "@/lib/messages";

import {Button} from "@/components/ui/button";
import {MarkdownText} from "@/components/assistant-ui/markdown-text";
import {TooltipIconButton} from "@/components/assistant-ui/tooltip-icon-button";
import {useOperationRefs} from "@/app/hooks/useOperationRefs";
import {Autocomplete, CircularProgress, TextField, IconButton} from "@mui/material";
import {Send} from "@mui/icons-material"
import {OperationRef} from "@/app/models/operationRef";
import {handleSelect} from "@/app/utils/handleSelect";
import {Participants} from "@/app/models/participants";

const DefaultImageComponent: FC<{ src: string; alt?: string }> = ({
                                                                      src,
                                                                      alt = "",
                                                                  }) => <img src={src} alt={alt}
                                                                             className="max-w-[240px] h-auto m-1 rounded-md shadow"/>;

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

interface ComposerActionProps {
    isImageMode: boolean;
    handleToggle: () => void;
}


export const Thread: FC<{ stageIndex: number }> = ({stageIndex}) => {
    const [isImageMode, setIsImageMode] = useState(false);

    const handleToggle = () => {
        setIsImageMode((prev) => !prev);
    };

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
                        EditComposer: EditComposer,
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

const ThreadWelcomeSuggestions: FC = () => {
    return (
        <div className="mt-3 flex w-full items-stretch justify-center gap-4">
            <ThreadPrimitive.Suggestion
                className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
                prompt="Пользователь загружает изображение. Сервер обрабатывает изображение. Результат сохраняется в базу данных."
                method="replace"
                autoSend
            >
        <span className="line-clamp-2 text-ellipsis text-sm font-semibold">
          Пример генерации изображения
        </span>
            </ThreadPrimitive.Suggestion>
            <ThreadPrimitive.Suggestion
                className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
                prompt="What is assistant-ui?"
                method="replace"
                autoSend
            >
        <span className="line-clamp-2 text-ellipsis text-sm font-semibold">
          What is assistant-ui?
        </span>
            </ThreadPrimitive.Suggestion>
        </div>
    );
};


const Composer = () => {
    const {options, loading} = useOperationRefs();
    const runtime = useThreadRuntime();

    const [selected, setSelected] = useState<OperationRef | null>(null);
    const [participantsCount, setParticipantsCount] = useState<number>(0);
    const [participants, setParticipants] = useState<Participants[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const send = async () => {
        if (isLoading)
            return

        setIsLoading(true)

        await handleSelect(selected, participants, runtime)

        setIsLoading(false)
    }

    const handleSelectChange = (_: SyntheticEvent, value: OperationRef | null) => {
        setSelected(value);
        setParticipantsCount(0);
        setParticipants([]);
    };

    const handleParticipantsCount = (_: SyntheticEvent, value: number | null) => {
        setParticipantsCount(value ?? 0)
        setParticipants(Array.from({length: value ?? 0}, () => ({
            name: "",
            type: "Физическое лицо",
            isResident: "Да"
        })));
    }

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
                    options={options}
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
                <Autocomplete
                    options={Array.from({length: (selected?.participants || 0) + 1}, (_, i) => i)}
                    getOptionLabel={(option) => `${option}`}
                    value={participantsCount}
                    onChange={handleParticipantsCount}
                    sx={{width: "180px"}}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Кол-во участников"
                            variant="outlined"
                            size="medium"
                            slotProps={{
                                input: {
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {params.InputProps.endAdornment}
                                        </>
                                    )
                                }
                            }}
                        />
                    )}
                />
                <IconButton aria-label="sent" onClick={send} style={{width: "56px"}}>
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
            <UserActionBar/>

            <div
                className="bg-muted text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5 col-start-2 row-start-2">
                <MessagePrimitive.Content/>
            </div>

            <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end"/>
        </MessagePrimitive.Root>
    );
};

const UserActionBar: FC = () => {
    return (
        <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            className="flex flex-col items-end col-start-1 row-start-2 mr-3 mt-2.5"
        >
            <ActionBarPrimitive.Edit asChild>
                <TooltipIconButton tooltip="Edit">
                    <PencilIcon/>
                </TooltipIconButton>
            </ActionBarPrimitive.Edit>
        </ActionBarPrimitive.Root>
    );
};

const EditComposer: FC = () => {
    return (
        <ComposerPrimitive.Root
            className="bg-muted my-4 flex w-full max-w-[var(--thread-max-width)] flex-col gap-2 rounded-xl">
            <ComposerPrimitive.Input
                className="text-foreground flex h-8 w-full resize-none bg-transparent p-4 pb-0 outline-none"/>

            <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
                <ComposerPrimitive.Cancel asChild>
                    <Button variant="ghost">Cancel</Button>
                </ComposerPrimitive.Cancel>
                <ComposerPrimitive.Send asChild>
                    <Button>Send</Button>
                </ComposerPrimitive.Send>
            </div>
        </ComposerPrimitive.Root>
    );
};

const AssistantMessage: FC = () => {
    return (
        <MessagePrimitive.Root
            className="grid grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-[var(--thread-max-width)] py-4">
            <div
                className="text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7 col-span-2 col-start-2 row-start-1 my-1.5 flex-wrap">
                <MessagePrimitive.Content
                    components={{
                        Text: MarkdownText,
                        // Image: DefaultImageComponent,
                    }}
                />
            </div>

            <AssistantActionBar/>

            <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2"/>
        </MessagePrimitive.Root>
    );
};

const AssistantActionBar: FC = () => {
    return (
        <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            autohideFloat="single-branch"
            className="text-muted-foreground flex gap-1 col-start-3 row-start-2 -ml-1 data-[floating]:bg-background data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
        >
            {/* <MessagePrimitive.If speaking={false}>
        <ActionBarPrimitive.Speak asChild>
          <TooltipIconButton tooltip="Read aloud">
            <AudioLinesIcon />
          </TooltipIconButton>
        </ActionBarPrimitive.Speak>
      </MessagePrimitive.If>
      <MessagePrimitive.If speaking>
        <ActionBarPrimitive.StopSpeaking asChild>
          <TooltipIconButton tooltip="Stop">
            <StopCircleIcon />
          </TooltipIconButton>
        </ActionBarPrimitive.StopSpeaking>
      </MessagePrimitive.If> */}
            <ActionBarPrimitive.Copy asChild>
                <TooltipIconButton tooltip="Copy">
                    <MessagePrimitive.If copied>
                        <CheckIcon/>
                    </MessagePrimitive.If>
                    <MessagePrimitive.If copied={false}>
                        <CopyIcon/>
                    </MessagePrimitive.If>
                </TooltipIconButton>
            </ActionBarPrimitive.Copy>
            <ActionBarPrimitive.Reload asChild>
                <TooltipIconButton tooltip="Refresh">
                    <RefreshCwIcon/>
                </TooltipIconButton>
            </ActionBarPrimitive.Reload>
        </ActionBarPrimitive.Root>
    );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
                                                                className,
                                                                ...rest
                                                            }) => {
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

const CircleStopIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            width="16"
            height="16"
        >
            <rect width="10" height="10" x="3" y="3" rx="2"/>
        </svg>
    );
};

