"use client";

import type {ReactNode} from "react";
import {AssistantRuntimeProvider, useLocalRuntime, type ChatModelAdapter,} from "@assistant-ui/react";

import {OperationDetails} from "@/app/models/operationDetails";
import {BACKEND_URL} from "@/app/api";
import {CustomAppendMessageType} from "@/app/models/customAppendMessage";

const MyModelAdapter: ChatModelAdapter = {
    async run({messages, abortSignal}) {

        const custom = (messages.at(-1) as CustomAppendMessageType | undefined)?.metadata?.custom

        if (!custom?.operation)
            return {content: [{type: "text", text: `❌ Операция не выбрана`}]};

        let res;
        try {
            res = await fetch(
                `${BACKEND_URL}/api/v1/operations/details/`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(
                        {
                            operation_id: custom.operation.operation_id,
                            participants: custom.participants,
                            log_id: custom.log_id,
                            doc_id: custom.doc_id
                        }
                    ),
                    signal: abortSignal
                }
            );
        } catch {
            return {content: [{type: "text", text: `❌ Не удалось связаться с сервером`}]};
        }

        if (!res.ok) {
            let errorText = `Произошла ошибка. Код: ${res.status}`;
            try {
                const errorJson = await res.json();
                if (errorJson?.error) {
                    errorText = errorJson.error;
                }
            } catch {
                return {content: [{type: "text", text: "❌ Непредвиденная ошибка"}]};
            }

            return {content: [{type: "text", text: `⚠️ ${errorText}`}]};
        }

        const data: OperationDetails = await res.json();

        const {log_id, guide_data, docs_data, legal_advice} = data;

        if (docs_data.length > 1) {
            return {
                content: [],
                metadata: {
                    custom: {log_id, operation: custom.operation, participants: custom.participants, docs_data}
                }
            };
        }

        const formattedGuide = guide_data
            .map(([name, section]) => `- **${name}** — раздел ${section}`)
            .join("\n");

        const formattedDocs = docs_data
            .map(([name]) => `- ${name}`)
            .join("\n");

        const content = legal_advice
            .map(item => {
                const {participant, advice} = item;

                const title = `👤 ${participant.name} (${participant.type}, Резидент: ${participant.isResident})`;

                return `\n\n### ${title}\n${advice}`
            });

        return {
            content: [
                {
                    type: "text",
                    text: `${content}\n\n### 📂 Документы\n\n${formattedDocs}\n\n### 📘 Руководство пользователя\n${formattedGuide}`
                }
            ],
            metadata: {
                custom: {log_id}
            }
        };
    }
};

type Props = {
    children: ReactNode
}

export function MyRuntimeProvider(props: Props) {
    const runtime = useLocalRuntime(MyModelAdapter);

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            {props.children}
        </AssistantRuntimeProvider>
    );
}
