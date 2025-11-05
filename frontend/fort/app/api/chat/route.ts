import {openai} from "@ai-sdk/openai";
import {jsonSchema, streamText} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    const {messages, system, tools} = await req.json();

    const result = streamText({
        model: openai("gpt-4o"),
        messages,
        system,
        tools: Object.fromEntries(
            Object.keys(tools).map((name) => [
                name,
                {...tools[name], parameters: jsonSchema(tools[name].parameters)},
            ])
        ),
    });

    return result.toDataStreamResponse();
}

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
