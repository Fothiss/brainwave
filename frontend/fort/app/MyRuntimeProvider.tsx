"use client";

import type {ReactNode} from "react";
import {AssistantRuntimeProvider, useLocalRuntime, type ChatModelAdapter,} from "@assistant-ui/react";

import {OperationRef} from "@/app/models/operationRef";
import {Participants} from "@/app/models/participants";
import {OperationDetails} from "@/app/models/operationDetails";
import {BACKEND_URL} from "@/app/api";

const MyModelAdapter: ChatModelAdapter = {
    async run({messages, abortSignal}) {

        const operation = messages.at(-1)?.metadata.custom.operation as OperationRef | null;
        const participants = messages.at(-1)?.metadata.custom.participants as Participants[];

        if (!operation)
            return {content: [{type: "text", text: `❌ Операция не выбрана`}]};

        let res;
        try {
            res = await fetch(
                `${BACKEND_URL}/api/v1/operations/details/`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({operation_id: operation.operation_id, participants}),
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
                    text: `### 📘 Руководство пользователя\n${formattedGuide}\n\n### 📂 Документы\n${formattedDocs}${content}`
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
