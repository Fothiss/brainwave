import {Participants} from "@/app/models/participants";

export interface OperationDetails {
    log_id: number;
    guide_data: Array<Array<string>>;
    docs_data: Array<Array<string>>;
    legal_advice: Array<{ participant: Participants, advice: string }>
}
