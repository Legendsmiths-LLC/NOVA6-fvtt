import { Radio } from "./module/components/Radio/Radio";
import { RangeSlider } from "./module/components/RangeSlider/RangeSlider";
import { Sortable } from "./module/components/Sortable/Sortable";
import { AspectItem } from "./module/item/aspect/AspectItem";
import { BaseItem } from "./module/item/BaseItem";
import { BaseComponent } from "./module/components/BaseComponent";

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
    },
    sheetComponents: {
        actor: {
            sortable: Sortable,
        },
        item: {
            radio: Radio,
            rangeSlider: RangeSlider,
        },
    }
};
