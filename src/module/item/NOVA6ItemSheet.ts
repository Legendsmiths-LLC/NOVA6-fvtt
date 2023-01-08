export class NOVA6ItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["nova6", "nova6-sheet", "nova6-sheet--item", "sheet"],
            tabs: [
                {
                    navSelector: ".nova6-js-tabs-navigation",
                    contentSelector: ".nova6-js-tab-content",
                    initial: "base",
                },
            ],
            scrollY: [".nova6-desk__content"],
            width: 575,
        });
    }

    async getData() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any = super.getData();

        // enforce data to ensure compatability between 0.7 and 0.8
        // @ts-ignore
        data.system = this.object.system;

        // Set owner name if possible
        data.isOwnedBy = this.actor ? this.actor.name : false;

        // Let every item type manipulate its own sheet data
        data = (await CONFIG.NOVA6.itemClasses[this.item.type]?.getSheetData(data, this)) || data;

        //WYSIWYG fields
        // @ts-ignore
        data.description = await TextEditor.enrichHTML(this.object.system.description, { async: true });

        // Let every component manipulate an items' sheet data
        for (const sheetComponent in CONFIG.NOVA6.sheetComponents.item) {
            if (Object.prototype.hasOwnProperty.call(CONFIG.NOVA6.sheetComponents.item, sheetComponent)) {
                data = CONFIG.NOVA6.sheetComponents.item[sheetComponent].getSheetData(data, this);
            }
        }

        return data;
    }

    get template() {
        // @ts-ignore
        return `systems/nova6/templates/item/${this.item.type}-sheet.hbs`;
    }

    activateListeners(html) {
        super.activateListeners(html);

        for (const sheetComponent in CONFIG.NOVA6.sheetComponents.item) {
            if (Object.prototype.hasOwnProperty.call(CONFIG.NOVA6.sheetComponents.item, sheetComponent)) {
                CONFIG.NOVA6.sheetComponents.item[sheetComponent].activateListeners(html, this);
            }
        }

        // Let every item type add its own sheet listeners
        CONFIG.NOVA6.itemClasses[this.item.type]?.activateListeners(html, this);
    }
}
