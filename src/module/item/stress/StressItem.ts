import { BaseItem } from "../BaseItem";
import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

const stressTypes = ["Physical", "Mental"];
const stressSeverities = ["Stressed", "Staggered", "Incapacitated"];

export class StressItem extends BaseItem {
    static documentName = "stress";

    static getActorSheetData(sheetData) {
        sheetData.stresses = sheetData.items.filter((item: ItemData) => item.type === "stress");

        sheetData.stressTypes = stressTypes;
        sheetData.stressSeverities = stressSeverities;

        return sheetData;
    }

    static prepareItemData(data, item) {
        stressTypes.forEach((type) => {
            data.data[type] = {};

            stressSeverities.forEach((severity) => {
                data.data[type][severity] = StressItem.createAndFillBoxes(item, type, severity);
            });
        });

        return data;
    }

    private static createAndFillBoxes(item, type: string, severity: string) {
        return [...Array(item.data.data[`num${type}${severity}`]).keys()].map((i) => {
            return {
                status: item.data.data.status?.[type]?.[severity]?.[i] ?? 0,
            };
        });
    }

    static getSheetData(sheetData, _item) {
        return sheetData;
    }

    /*************************
     * EVENT HANDLER
     *************************/
}
