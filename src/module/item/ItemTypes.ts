interface AspectData {
    text: string;
    label: string;
    invoked: boolean;
}

export interface AspectItemData {
    type: "aspect";
    data: AspectData;
}

export interface SkillData {
    name: string;
    rank: number;
    focused: boolean;
    practiced: boolean;
    specialized: boolean;
    perks: string;
    perk1: string;
    perk2: string;
    perk3: string;
    perk4: string;
    perk5: string;
    perk6: string;
    perk7: string;
    perk8: string;
    perk9: string;
}

export interface SkillItemData {
    type: "skill";
    data: SkillData;
}

interface TalentData {
    name: string;
    description: string;
}

export interface TalentItemData {
    type: "talent";
    data: TalentData;
}

interface AssetData {
    name: string;
    description: string;
}

export interface AssetItemData {
    type: "asset";
    data: AssetData;
}

interface StressData {
    numPhysicalStressed: number;
    numPhysicalStaggered: number;
    numPhysicalIncapacitated: number;
    numMentalStressed: number;
    numMentalStaggered: number;
    numMentalIncapacitated: number;
    status: {
        physical: {
            stressed: [];
            staggered: [];
            incapacitated: [];
        };
        mental: {
            stressed: [];
            staggered: [];
            incapacitated: [];
        };
    };
}

export interface StressItemData {
    type: "stress";
    data: StressData;
}

export type NOVA6ItemData = AspectItemData | SkillItemData | TalentItemData | AssetItemData | StressItemData;
