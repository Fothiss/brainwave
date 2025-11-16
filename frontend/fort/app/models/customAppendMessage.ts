import {CreateAppendMessage} from "@assistant-ui/react";

import {OperationRef} from "@/app/models/operationRef";
import {Participants} from "@/app/models/participants";

type CustomMetadataType = {
    custom: {
        log_id: number | undefined;
        operation: OperationRef | undefined;
        participants: Participants[] | undefined;
        doc_id: number | undefined;
    };
};

export type CustomAppendMessageType = CreateAppendMessage & {
    metadata?: CustomMetadataType;
};
