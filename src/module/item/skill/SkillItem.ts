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
                    item.system.perk1,
                    item.system.perk2,
                    item.system.perk3,
                    item.system.perk4,
                    item.system.perk5,
                    item.system.perk6,
                    item.system.perk7,
                    item.system.perk8,
                    item.system.perk9,
                ];

                item.system.perks = perkData.filter((perk) => perk !== "").join(", ");

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
        // @ts-ignore
        const skill = sheet.actor.items.get(skillId)?.system as SkillItemData;

        if (skill) {
            new RollDialog(sheet.actor, skill).render(true);
        }
    }
}
