import {ThreadRuntime} from "@assistant-ui/react";

import {OperationRef} from "@/app/models/operationRef";
import {Participants} from "@/app/models/participants";

export const handleSelect = async (
    operation: OperationRef | null,
    participants: Participants[],
    runtime: ThreadRuntime
) => {
    if (!operation) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    runtime.append({
        role: "user",
        content: [{type: "text", text: `Операция: ${operation.name}`}]
    });

    let res;
    try {
        res = await fetch(`${backendUrl}/api/v1/operations/details/`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({operation_id: operation.operation_id, participants})
        });
    } catch {
        runtime.append({
            role: "assistant",
            content: [{type: "text", text: `❌ Не удалось связаться с сервером`}]
        });
        return;
    }

    if (!res.ok) {
        let errorText = `Произошла ошибка. Код: ${res.status}`;
        try {
            const errorJson = await res.json();
            if (errorJson?.error) {
                errorText = errorJson.error;
            }
        } catch {
            runtime.append({
                role: "assistant",
                content: [{type: "text", text: "Непредвиденная ошибка"}]
            });
            return;
        }

        runtime.append({
            role: "assistant",
            content: [{type: "text", text: `⚠️ ${errorText}`}]
        });
        return;
    }

    const data = await res.json();

    const {guide_data, docs_data, legal_advice} = data;

    const formattedGuide = (guide_data as Array<Array<string>>)
        .map(([name, section]) => `- **${name}** — раздел ${section}`)
        .join("\n");

    runtime.append({
        role: "assistant",
        content: [{type: "text", text: `### 📘 Руководство пользователя\n${formattedGuide}`}]
    });

    const formattedDocs = (docs_data as Array<Array<string>>)
        .map(([name]) => `- ${name}`)
        .join("\n");

    runtime.append({
        role: "assistant",
        content: [{type: "text", text: `### 📂 Документы\n${formattedDocs}`}]
    });

    (legal_advice as Array<{ participant: Participants, advice: string }>).forEach(item => {
        const {participant, advice} = item;

        const title = `👤 ${participant.name} (${participant.type}, Резидент: ${participant.isResident})`;

        runtime.append({
            role: "assistant",
            content: [
                {type: "text", text: `### ${title}\n${advice}`}
            ]
        });
    });
};
