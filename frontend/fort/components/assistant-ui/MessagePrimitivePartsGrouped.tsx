import {MessagePrimitive} from "@assistant-ui/react";

import {MarkdownText} from "@/components/assistant-ui/MarkdownText";

export default function MessagePrimitivePartsGrouped() {
    return (
        <MessagePrimitive.Unstable_PartsGrouped
            groupingFunction={(parts) => {
                return parts.map((_, i) => ({
                    groupKey: `variant-${i}`,
                    indices: [i]
                }));
            }}
            components={{
                Group: ({children}) => (
                    <div className="p-3 bg-white border rounded-lg shadow " style={{flex: 1}}>
                        {children}
                    </div>
                ),
                Text: MarkdownText
            }}
        />
    )
}
