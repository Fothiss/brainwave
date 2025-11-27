import {CreateAppendMessage} from "@assistant-ui/react";

import {OperationRef} from "@/app/models/operationRef";
import {Participants} from "@/app/models/participants";

type CustomMetadataType = {
    custom: {
        log_id?: number;
        operation?: OperationRef;
        participants?: Participants[];
        doc_id?: number;
    };
};

export type CustomAppendMessageType = CreateAppendMessage & {
    metadata?: CustomMetadataType;
};
