import {ThreadPrimitive} from "@assistant-ui/react";
import {ArrowDownIcon} from "lucide-react";

import {TooltipIconButton} from "@/components/assistant-ui/tooltip-icon-button";

export default function ThreadScrollToBottom() {
    return (
        <ThreadPrimitive.ScrollToBottom asChild>
            <TooltipIconButton
                tooltip="Scroll to bottom"
                variant="outline"
                className="absolute -bottom-0 mb-3 rounded-full disabled:invisible"
            >
                <ArrowDownIcon/>
            </TooltipIconButton>
        </ThreadPrimitive.ScrollToBottom>
    );
};
