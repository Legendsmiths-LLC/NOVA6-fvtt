import { reloadActorSheets } from "../helper/Settings";

export class StressPoints {
    static hooks() {
        Hooks.once("init", () => {
            game.settings.register("nova6", "enableStressPointsDamageSystem", {
                name: game.i18n.localize("NOVA.Settings.enableStressPointsDamageSystem.Name"),
                hint: game.i18n.localize("NOVA.Settings.enableStressPointsDamageSystem.Hint"),
                scope: "world",
                config: true,
                default: false,
                type: Boolean,
                onChange: reloadActorSheets,
            });
        });

        Hooks.once("ready", async () => {
            if (game.settings.get("nova6", "enableStressPointsDamageSystem")) {
                const actors = game.actors?.filter((actor) => {
                    return !actor.items.find((item) => item.type === "stressPoints");
                });

                actors?.forEach((actor) => {
                    actor.createEmbeddedDocuments("Item", [
                        {
                            name: "Stress Points",
                            type: "stressPoints",
                        },
                    ]);
                });
            }
        });
    }
}
