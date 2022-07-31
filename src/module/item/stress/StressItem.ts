import { BaseItem } from "../BaseItem";
import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

const stressTypes = ["Physical", "Mental"];
const stressSeverities = ["Stressed", "Staggered", "Incapacitated"];
const stressDurations = ["C", "B", "Q", "S", "T", "L", "LL", "E", "P"];

export class StressItem extends BaseItem {
    static documentName = "stress";

    static activateActorSheetListeners(html, sheet) {
        super.activateActorSheetListeners(html, sheet);

        html.find(".nova6-js-stress-checkbox").click((e) => this._onStressBoxClear.call(this, e, sheet));
        html.find(".nova6-stress__selector div").click((e) => this._onStressBoxChange.call(this, e, sheet));
    }

    static getActorSheetData(sheetData) {
        sheetData.stresses = sheetData.items.filter((item: ItemData) => item.type === "stress");

        sheetData.stressTypes = stressTypes;
        sheetData.stressSeverities = stressSeverities;

        sheetData.stressDurations = stressDurations.map((duration) => ({
            duration,
            label: game.i18n.localize(`NOVA.Item.Stress.Durations.${duration}`),
        }));

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
        sheetData.availableBoxes = [...Array(5).keys()].map((i) => i + 1);

        return sheetData;
    }

    /*************************
     * EVENT HANDLER
     *************************/

    private static _onStressBoxClear(e, sheet) {
        e.preventDefault();

        const dataset = e.currentTarget.dataset;
        const item = sheet.actor.items.get(dataset.item);

        if (item) {
            item.update({
                [`data.status.${dataset.type}.${dataset.severity}.${dataset.index}`]: "C",
            }).then(() => {
                this._updateConditions(item, sheet);
            });
        }
    }

    private static _onStressBoxChange(e, sheet) {
        e.preventDefault();

        const dataset = e.currentTarget.parentElement.dataset;
        const duration = e.currentTarget.dataset.duration;
        const item = sheet.actor.items.get(dataset.item);

        if (item) {
            item.update({
                [`data.status.${dataset.type}.${dataset.severity}.${dataset.index}`]: duration,
            }).then(() => {
                this._updateConditions(item, sheet);
            });
        }
    }

    private static _updateConditions(item, sheet) {
        const status = item.data.data.status;

        stressSeverities.forEach((severity) => {
            let isActive = false;

            stressTypes.forEach((type) => {
                const stress = Object.values(status[type]?.[severity] ?? {});
                const numStress = stress.filter((status) => status !== "C").length;

                if (numStress >= item.data.data[`num${type}${severity}`]) {
                    isActive = true;
                }
            });

            sheet.actor.update({
                [`data.conditions.${severity.toLowerCase()}`]: isActive,
            });
        });
    }
}
