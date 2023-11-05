import { reloadActorSheets } from "../helper/Settings";

export class RollConfig {
    static hooks() {
        Hooks.once("init", () => {
            game.settings.register("nova6", "enableDread", {
                name: game.i18n.localize("NOVA.Settings.enableDread.Name"),
                hint: game.i18n.localize("NOVA.Settings.enableDread.Hint"),
                scope: "world",
                config: true,
                default: false,
                type: Boolean,
                onChange: reloadActorSheets,
            });

            game.settings.register("nova6", "enableCourage", {
                name: game.i18n.localize("NOVA.Settings.enableCourage.Name"),
                hint: game.i18n.localize("NOVA.Settings.enableCourage.Hint"),
                scope: "world",
                config: true,
                default: false,
                type: Boolean,
                onChange: reloadActorSheets,
            });

            game.settings.register("nova6", "enableUnrealInsight", {
                name: game.i18n.localize("NOVA.Settings.enableUnrealInsight.Name"),
                hint: game.i18n.localize("NOVA.Settings.enableUnrealInsight.Hint"),
                scope: "world",
                config: true,
                default: false,
                type: Boolean,
                onChange: reloadActorSheets,
            });
        });
    }
}
