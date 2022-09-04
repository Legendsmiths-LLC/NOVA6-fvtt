import { BaseItem } from "../BaseItem";
import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import { SkillItemData } from "../ItemTypes";
import { RollDialog } from "../../applications/RollDialog";

export class SkillItem extends BaseItem {
    static documentName = "skill";

    static getActorSheetData(sheetData) {
        sheetData.skills = sheetData.items
            .filter((item: ItemData) => item.type === "skill")
            .map((item: SkillItemData) => {
                const perkData = [
                    item.data.perk1,
                    item.data.perk2,
                    item.data.perk3,
                    item.data.perk4,
                    item.data.perk5,
                    item.data.perk6,
                    item.data.perk7,
                    item.data.perk8,
                    item.data.perk9,
                ];

                item.data.perks = perkData.filter((perk) => perk !== "").join(", ");

                return item;
            });

        return sheetData;
    }

    static getSheetData(sheetData, _item) {
        sheetData.availableRanks = [...Array(10).keys()];

        return sheetData;
    }

    static activateActorSheetListeners(html, sheet) {
        super.activateActorSheetListeners(html, sheet);

        html.find(".nova6-headline--skill").click((e) => this._onRollSkill.call(this, e, sheet));
    }

    /*************************
     * EVENT HANDLER
     *************************/

    static _onRollSkill(e: JQuery.ClickEvent, sheet: ActorSheet) {
        e.preventDefault();

        const skillId = e.currentTarget.parentNode.dataset.itemId;
        const skill = sheet.actor.items.get(skillId)?.data as SkillItemData;

        if (skill) {
            new RollDialog(sheet.actor, skill).render(true);
        }
    }
}
