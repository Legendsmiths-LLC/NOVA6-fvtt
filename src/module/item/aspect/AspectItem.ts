import { BaseItem } from "../BaseItem";
import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

export class AspectItem extends BaseItem {
    static documentName = "aspect";

    static activateActorSheetListeners(html, sheet) {
        super.activateActorSheetListeners(html, sheet);

        html.find(".nova6-js-aspect-checkbox").click((e) => this._onAspectInvokeToggle.call(this, e, sheet));
        html.find(".nova6-js-aspect-input").on("blur", (e) => this._onAspectTextChange.call(this, e, sheet));
    }

    static getActorSheetData(sheetData) {
        sheetData.aspects = sheetData.items.filter((item: ItemData) => item.type === "aspect");

        return sheetData;
    }

    /*************************
     * EVENT HANDLER
     *************************/

    static _onAspectInvokeToggle(e, sheet) {
        e.preventDefault();

        const dataset = e.currentTarget.dataset;
        const item = sheet.actor.items.get(dataset.itemId);

        if (item) {
            item.update({
                "data.invoked": !item.data.data.invoked
            });
        }
    }

    static _onAspectTextChange(e, sheet) {
        e.preventDefault();

        const dataset = e.currentTarget.dataset;
        const item = sheet.actor.items.get(dataset.itemId);
        const input = $(e.currentTarget).html();

        // Check if the value of the input field changed
        if (item.data.data.text === input) {
            return;
        }

        if (item) {
            item.update({
                "data.text": input
            });
        }
    }
}
