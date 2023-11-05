export class NOVA6Settings {
    static registerSettings() {}
}

export const reloadActorSheets = () => {
    for (const app of Object.values(ui.windows)) {
        if (app instanceof ActorSheet) {
            app.render();
        }
    }
};
