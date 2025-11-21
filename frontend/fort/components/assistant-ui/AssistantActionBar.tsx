import {ActionBarPrimitive} from "@assistant-ui/react";
import {SaveIcon} from "lucide-react";

import {TooltipIconButton} from "@/components/assistant-ui/TooltipIconButton";

type Props = {
    onSave: () => void
}

export default function AssistantActionBar(props: Props) {
    return (
        <ActionBarPrimitive.Root
            hideWhenRunning
            autohideFloat="single-branch"
            className="text-muted-foreground flex gap-1 col-start-3 row-start-2 -ml-1 data-[floating]:bg-background data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
        >
            <TooltipIconButton
                tooltip="Сохранить"
                onClick={props.onSave}
            >
                <SaveIcon/>
            </TooltipIconButton>
        </ActionBarPrimitive.Root>
    );
};
