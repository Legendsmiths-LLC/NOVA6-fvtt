import { BaseItem } from "../BaseItem";
import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import { stressTypes } from "./StressItem";

export class StressPointsItem extends BaseItem {
    static documentName = "stressPoints";

    static getActorSheetData(sheetData) {
        sheetData.stressPoints = sheetData.items.filter((item: ItemData) => item.type === "stressPoints");

        return sheetData;
    }

    static prepareItemData(item) {
        stressTypes.forEach((type) => {
            item.system[type] = StressPointsItem.createAndFillBoxes(item, type);
        });

        return item;
    }

    private static createAndFillBoxes(item, type: string) {
        return [...Array(item.system[`num${type}`]).keys()].map((i, index, arr) => {
            return {
                status: item.system.status?.[type]?.["base"]?.[i] ?? 0,
                break: index === Math.ceil(arr.length / 2) - 1,
            };
        });
    }
}
