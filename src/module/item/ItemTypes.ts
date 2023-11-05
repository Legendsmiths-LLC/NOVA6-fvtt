interface AspectData {
    text: string;
    label: string;
    invoked: boolean;
}

export interface AspectItemData {
    type: "aspect";
    system: AspectData;
}

export interface SkillData {
    name: string;
    rank: number;
    focused: boolean;
    practiced: boolean;
    specialized: boolean;
    allPerks: string;
    perk1: string;
    perk2: string;
    perk3: string;
    perk4: string;
    perk5: string;
    perk6: string;
    perk7: string;
    perk8: string;
    perk9: string;
    description: string;
}

export interface SkillItemData {
    type: "skill";
    system: SkillData;
}

interface TalentData {
    name: string;
    description: string;
}

export interface TalentItemData {
    type: "talent";
    system: TalentData;
}

interface AssetData {
    name: string;
    description: string;
}

export interface AssetItemData {
    type: "asset";
    system: AssetData;
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
    system: StressData;
}

interface StressPointsData {
    numPhysicalStressPoints: number;
    numMentalStressPoints: number;
    status: {
        physical: {
            base: [];
        };
        mental: {
            base: [];
        };
    };
}

export interface StressPointsItemData {
    type: "stressPoints";
    system: StressPointsData;
}

export type NOVA6ItemData =
    | AspectItemData
    | SkillItemData
    | TalentItemData
    | AssetItemData
    | StressItemData
    | StressPointsItemData;
