import {SyntheticEvent, useEffect, useState} from "react";
import {CreateAppendMessage, useThreadRuntime} from "@assistant-ui/react";
import {Autocomplete, CircularProgress, IconButton, TextField} from "@mui/material";
import {Send} from "@mui/icons-material";

import {OperationRef} from "@/app/models/operationRef";
import {Participants} from "@/app/models/participants";
import {useOperationRefs} from "@/app/hooks/useOperationRefs";

type CustomMetadataType = {
    custom: {
        operation: OperationRef | null;
        participants: Participants[];
    };
};

type CustomAppendMessageType = CreateAppendMessage & {
    metadata?: CustomMetadataType;
};

export default function Composer() {
    const {operations, loading} = useOperationRefs();
    const runtime = useThreadRuntime();

    const [selected, setSelected] = useState<OperationRef | null>(null);
    const [participants, setParticipants] = useState<Participants[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = runtime.subscribe(() => {
            setIsLoading(runtime.getState().isRunning)
        })

        return () => unsubscribe()
    }, []);

    const sendMessage = () => {
        if (isLoading)
            return

        const message: CustomAppendMessageType = {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `Операция: ${selected?.name}`
                }
            ],
            metadata: {
                custom: {
                    operation: selected,
                    participants
                }
            }
        };

        runtime.append(message);
    }

    const handleSelectChange = (_: SyntheticEvent, value: OperationRef | null) => {
        setSelected(value);
        setParticipants(Array.from({length: value?.participants ?? 0}, () => ({
            name: "",
            type: "Физическое лицо",
            isResident: "Да"
        })));
    };

    const updateParticipant = (index: number, key: "name" | "type" | "isResident", value: string) => {
        setParticipants(prev => {
            const updated = [...prev];
            updated[index] = {...updated[index], [key]: value};
            return updated;
        });
    };

    return (
        <div style={{width: "100%", display: "grid", gap: "10px"}}>
            <div style={{width: "100%", display: "flex", gap: "10px"}}>
                <Autocomplete
                    options={operations}
                    getOptionLabel={(option) => `${option.name}`}
                    loading={loading}
                    onChange={handleSelectChange}
                    filterSelectedOptions
                    fullWidth
                    sx={{flexGrow: 1}}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Выберите операцию"
                            variant="outlined"
                            size="medium"
                            slotProps={{
                                input: {
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress color="inherit" size={20}/> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    )
                                }
                            }}
                        />
                    )}
                />
                <IconButton aria-label="sent" onClick={sendMessage} style={{width: "56px"}}>
                    {
                        isLoading
                            ? <CircularProgress color="inherit" size={20}/>
                            : <Send/>
                    }
                </IconButton>
            </div>
            <div style={{width: "100%", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px"}}>
                {
                    participants.map((p, idx) => (
                        <div key={idx} style={{display: "flex", gap: "10px", width: "100%", alignItems: "center"}}>

                            <p style={{width: "150px"}}>Участник {idx + 1}</p>

                            <Autocomplete
                                options={["Физическое лицо", "Юридическое лицо"]}
                                value={p.type}
                                onChange={(_, value) => updateParticipant(idx, "type", value || "Физическое лицо")}
                                sx={{width: "100%"}}
                                renderInput={(params) => (
                                    <TextField {...params} label="Тип лица" variant="outlined"/>
                                )}
                            />

                            <Autocomplete
                                options={["Да", "Нет"]}
                                value={p.isResident}
                                onChange={(_, value) => updateParticipant(idx, "isResident", value || "Да")}
                                sx={{width: "290px"}}
                                renderInput={(params) => (
                                    <TextField {...params} label="Налоговый резидент РФ" variant="outlined"/>
                                )}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    );
};
