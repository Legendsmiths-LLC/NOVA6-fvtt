import { BaseComponent } from "../BaseComponent";

/**
 * Checkbox component for actor- and item sheets.
 * Allows the user to enable/disable a single setting.
 */
export class Checkbox extends BaseComponent {
    /**
     * Adds a click listener to every .nova6-js-checkbox element.
     * The name of the field, the value of the field and more are loaded via datasets.
     *
     * @param html
     *   The html of the inner part of the rendered sheet.
     *
     * @param sheet
     *   The actor- or item sheet to be referenced inside the handler.
     */
    static activateListeners(html, sheet) {
        html.find(".nova6-js-checkbox").click((e) => this._onSettingsCheckbox.call(this, e, sheet));
    }

    /**
     * OnClick-Handler for radio setting components.
     * Updates the sheets referenced document with a given name and value (via dataset).
     *
     * @param event
     *   The event that was fired on the sheet.
     *
     * @param sheet
     *   The sheet on which the event was fired.
     */
    static _onSettingsCheckbox(event, sheet) {
        event.preventDefault();

        const target = event.currentTarget as HTMLInputElement;
        const dataset = target.dataset;
        const dataKey = dataset.name as string;
        const sheetDocument = sheet.document;

        sheetDocument.update({
            [dataKey]: target.checked,
        });
    }
}
