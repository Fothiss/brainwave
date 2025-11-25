import {MessagePrimitive, useMessage, useThreadRuntime} from "@assistant-ui/react";

import {MarkdownText} from "@/components/assistant-ui/MarkdownText";

export default function MessagePrimitivePartsGrouped() {
    const message = useMessage();
    const runtime = useThreadRuntime();

    const selectVariant = (index: number) => {
        const state = runtime.getState();
        const oldMessages = state.messages ?? [];

        const newMessages = oldMessages.map((m) => {
            if (m.id !== message.id) return m;
            const parts = Array.isArray(m.content) ? m.content : [];
            if (index < 0 || index >= parts.length) return m;

            return {
                ...m,
                content: [parts[index]],
            };
        });

        runtime.reset(newMessages);
    };

    return (
        <MessagePrimitive.Unstable_PartsGrouped
            groupingFunction={(parts) =>
                parts.map((_, i) => ({
                    groupKey: `variant-${i}`,
                    indices: [i],
                }))
            }
            components={{
                Group: ({children, indices}) => {
                    const idx = Array.isArray(indices) && indices.length > 0 ? indices[0] : 0;
                    return (
                        <div
                            className="p-3 bg-white border rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
                            style={{flex: 1}}
                            onClick={() => selectVariant(idx)}
                        >
                            {children}
                        </div>
                    );
                },
                Text: MarkdownText,
            }}
        />
    );
}
