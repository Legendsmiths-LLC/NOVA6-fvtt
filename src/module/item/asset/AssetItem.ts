import { BaseItem } from "../BaseItem";
import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

export class AssetItem extends BaseItem {
    static documentName = "asset";

    static getActorSheetData(sheetData) {
        sheetData.assets = sheetData.items.filter((item: ItemData) => item.type === "asset");

        return sheetData;
    }

    static getSheetData(sheetData, _item) {
        return sheetData;
    }

    /*************************
     * EVENT HANDLER
     *************************/
}
