import { BaseComponent } from "../BaseComponent";

export class LoadLevel extends BaseComponent {
    static getSheetData(sheetData, sheet) {
        sheetData.loadLevelDescription = game.i18n.localize(
            `NOVA.Sheet.LoadLevel.${sheet.actor.data.data.load}.description`
        );

        sheetData.loadChoices = {
            0: game.i18n.localize("NOVA.Sheet.LoadLevel.0.name"),
            1: game.i18n.localize("NOVA.Sheet.LoadLevel.1.name"),
            2: game.i18n.localize("NOVA.Sheet.LoadLevel.2.name"),
            3: game.i18n.localize("NOVA.Sheet.LoadLevel.3.name"),
            4: game.i18n.localize("NOVA.Sheet.LoadLevel.4.name"),
        };

        return sheetData;
    }
}
