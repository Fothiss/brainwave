import {ThreadPrimitive} from "@assistant-ui/react";
import {FC, useState} from "react";
import {ArrowDownIcon, GlobeIcon} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {TooltipIconButton} from "@/components/assistant-ui/tooltip-icon-button";
import AssistantMessage from "@/components/assistant-ui/AssistantMessage";
import ThreadWelcome from "@/components/assistant-ui/ThreadWelcome";
import UserMessage from "@/components/assistant-ui/UserMessage";
import Composer from "@/components/assistant-ui/Composer";


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
                <ThreadWelcome/>

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
