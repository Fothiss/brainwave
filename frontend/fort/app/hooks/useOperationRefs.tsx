import {useEffect, useState} from "react";

import {OperationRef} from "@/app/models/operationRef";
import {BACKEND_URL} from "@/app/api";

type UseOperationRefsReturnsType = {
    operations: OperationRef[];
    loading: boolean;
}

export const useOperationRefs = (): UseOperationRefsReturnsType => {
    const [operations, setOperations] = useState<OperationRef[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchAll = async () => {
            setLoading(true);

            let page = 1;
            let all: OperationRef[] = [];

            while (true) {
                const res = await fetch(`${BACKEND_URL}/api/v1/operations/?page=${page}&page_size=100`);
                if (!res.ok) break;

                const data = await res.json();
                all = [...all, ...data.results];
                if (!data.next) break;

                page += 1;
            }

            if (!cancelled) setOperations(all);

            setLoading(false);
        };

        fetchAll().then();

        return () => {
            cancelled = true;
        };
    }, []);

    return {operations, loading};
};
