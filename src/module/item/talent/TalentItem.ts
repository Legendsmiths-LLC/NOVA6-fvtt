import { BaseItem } from "../BaseItem";
import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

export class TalentItem extends BaseItem {
    static documentName = "talent";

    static getActorSheetData(sheetData) {
        sheetData.talents = sheetData.items.filter((item: ItemData) => item.type === "talent");

        return sheetData;
    }

    static async getSheetData(sheetData, itemSheet) {
        // @ts-ignore
        sheetData.enrichedDescription = await TextEditor.enrichHTML(itemSheet.item.system.description, { async: true });

        return sheetData;
    }

    /*************************
     * EVENT HANDLER
     *************************/
}
