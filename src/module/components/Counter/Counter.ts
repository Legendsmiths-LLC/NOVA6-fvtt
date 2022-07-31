import { BaseComponent } from "../BaseComponent";

export class Counter extends BaseComponent {
    static activateListeners(html, sheet) {
        html.find(".nova6-js-increment").click((e) => this._onChangeCount.call(this, e, sheet));
        html.find(".nova6-js-decrement").click((e) => this._onChangeCount.call(this, e, sheet, true));
    }

    private static _onChangeCount(e, sheet, doDecrement = false) {
        e.preventDefault();

        const field = e.currentTarget.dataset.name;

        if (field) {
            const newValue = Number(getProperty(sheet.actor.data, field)) + (doDecrement ? -1 : 1);

            sheet.actor.update({
                [field]: newValue,
            });
        }
    }
}
