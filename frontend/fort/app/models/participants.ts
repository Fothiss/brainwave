export interface Participants {
    name: string;
    type: "Физическое лицо" | "Юридическое лицо" | "ОДС (счет общей долевой собственности)" | "Госорганы" | "РФ";
    isResident: "Да" | "Нет";
}
