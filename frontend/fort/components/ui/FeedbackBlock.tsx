import {FC, useState} from "react";
import {toast} from "sonner";
import {TextField} from "@mui/material";
import {Button} from "@/components/ui/Button";

import {Property} from "csstype";

interface FeedbackBlockProps {
    logId: number;
}

export const FeedbackBlock: FC<FeedbackBlockProps> = ({logId}) => {
    const [voted, setVoted] = useState<null | "yes" | "no">(null);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [display, setDisplay] = useState<Property.Display>("block")

    const sendFeedback = async () => {
        if (!logId || voted === null) return;

        setLoading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

            const res = await fetch(`${backendUrl}/api/v1/operations/feedback/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    log_id: logId,
                    feedback: voted === "yes" ? 1 : 0,
                    user_comment: comment
                })
            });

            if (!res.ok) throw new Error("Не удалось отправить отзыв");

            toast.success("Спасибо за отзыв!");
            setVoted(null);
            setComment("");
            setDisplay("none")
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 border rounded-lg p-3 bg-muted/40" style={{display}}>
            {
                !voted && (
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Был ли ответ полезен?</span>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={() => setVoted("yes")}>Да</Button>
                            <Button size="sm" variant="outline" onClick={() => setVoted("no")}>Нет</Button>
                        </div>
                    </div>
                )
            }

            {
                voted && (
                    <div className="flex flex-col gap-2">
                        <span className="text-sm">
                            Спасибо! {voted === "no" && "Расскажите, что улучшить?"}
                        </span>

                        <TextField
                            placeholder="Комментарий (необязательно)"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />

                        <Button size="sm" onClick={sendFeedback} disabled={loading} className="self-start">
                            {loading ? "Отправка…" : "Отправить"}
                        </Button>
                    </div>
                )
            }
        </div>
    );
};
