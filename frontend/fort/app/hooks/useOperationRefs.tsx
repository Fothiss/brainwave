import {useEffect, useState} from "react";
import {OperationRef} from "@/app/models/operationRef";

export const useOperationRefs = () => {
    const [options, setOptions] = useState<OperationRef[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchAll = async () => {
            setLoading(true);
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
            let page = 1;
            let all: OperationRef[] = [];

            while (true) {
                const res = await fetch(`${backendUrl}/api/v1/operations/?page=${page}&page_size=100`);
                if (!res.ok) break;

                const data = await res.json();
                all = [...all, ...data.results];
                if (!data.next) break;

                page += 1;
            }

            if (!cancelled) setOptions(all);
            setLoading(false);
        };

        fetchAll();

        return () => {
            cancelled = true;
        };
    }, []);

    return {options, loading};
};
