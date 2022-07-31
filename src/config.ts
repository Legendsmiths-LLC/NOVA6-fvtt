import { Radio } from "./module/components/Radio/Radio";
import { RangeSlider } from "./module/components/RangeSlider/RangeSlider";
import { Sortable } from "./module/components/Sortable/Sortable";
import { AspectItem } from "./module/item/aspect/AspectItem";
import { BaseItem } from "./module/item/BaseItem";
import { BaseComponent } from "./module/components/BaseComponent";
import { SkillItem } from "./module/item/skill/SkillItem";
import { Checkbox } from "./module/components/Checkbox/Checkbox";
import { StressItem } from "./module/item/stress/StressItem";
import { TalentItem } from "./module/item/talent/TalentItem";
import { AssetItem } from "./module/item/asset/AssetItem";
import { LoadLevel } from "./module/components/LoadLevel/LoadLevel";
import { Counter } from "./module/components/Counter/Counter";

export interface Nova6Config {
    itemClasses: {
        [key: string]: typeof BaseItem;
        [key: number]: typeof BaseItem;
    };

    sheetComponents: {
        actor: {
            [key: string]: typeof BaseComponent;
            [key: number]: typeof BaseComponent;
        };
        item: {
            [key: string]: typeof BaseComponent;
            [key: number]: typeof BaseComponent;
        };
    };
}

export const NOVA6: Nova6Config = {
    itemClasses: {
        aspect: AspectItem,
        skill: SkillItem,
        stress: StressItem,
        talent: TalentItem,
        asset: AssetItem,
    },
    sheetComponents: {
        actor: {
            sortable: Sortable,
            loadLevel: LoadLevel,
            counter: Counter,
        },
        item: {
            radio: Radio,
            rangeSlider: RangeSlider,
            checkbox: Checkbox,
        },
    },
};
