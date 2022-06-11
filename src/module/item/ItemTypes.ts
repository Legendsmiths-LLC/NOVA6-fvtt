interface AspectData {
    name: string;
}

export interface AspectItemData {
    type: "aspect";
    data: AspectData;
}

export type NOVA6ItemData =
    | AspectItemData
