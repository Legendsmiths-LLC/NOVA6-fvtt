/**
 * NOVA6 base class for all actor sheets.
 * Defines what information on the actor's sheet may be rendered.
 */
import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

export class CharacterSheet extends ActorSheet {
    /**
     * Defines the default options for all NOVA6 actor sheets.
     * This consists of things like css classes, the sheet type and the tab configuration.
     */
    static get defaultOptions() {
        const sheetOptions = {
            classes: ["nova6", "nova6-sheet", "sheet"],
            tabs: [
                {
                    navSelector: ".nova6-js-tabs-navigation",
                    contentSelector: ".nova6-js-tab-content",
                    initial: "base",
                },
            ],
            scrollY: [".nova6-desk__content"],
            template: "systems/nova6/templates/actor/character.hbs",
            width: 900,
        };

        return mergeObject(super.defaultOptions, sheetOptions);
    }

    /**
     * Activates DOM-listeners on elements to react to different events like "click" or "change".
     * ItemTypes and sheet components can activate their own listeners and receive the sheet as a reference.
     *
     * @param html
     *  The rendered html content of the created actor sheet.
     */
    activateListeners(html: JQuery) {
        super.activateListeners(html);

        // Custom sheet listeners for every ItemType
        for (const itemType in CONFIG.NOVA6.itemClasses) {
            CONFIG.NOVA6.itemClasses[itemType]?.activateActorSheetListeners(html, this);
        }

        // Custom sheet listeners for every SheetComponent
        for (const sheetComponent in CONFIG.NOVA6.sheetComponents.actor) {
            CONFIG.NOVA6.sheetComponents.actor[sheetComponent].activateListeners(html, this);
        }
    }

    /**
     * Returns all data that is needed to render the sheet.
     * All variables are available inside the handelbar templates.
     *
     * Items are split into their categories for easier access.
     *
     * returns {Object}
     */
    getData() {
        // Basic fields and flags
        let data: any = {
            owner: this.actor.isOwner,
            options: this.options,
            editable: this.isEditable,
            isEmptyActor: !this.actor.items.size,
            isToken: this.token && !this.token.data.actorLink,
            config: CONFIG.NOVA6,
        };

        // Add actor, actor data and item
        data.actor = duplicate(this.actor.data);
        data.data = data.actor.data;
        data.items = this.actor.items.map((item) => item.data);
        data.items.sort((a: ItemData, b: ItemData) => (a.sort || 0) - (b.sort || 0));

        // Allow every item type to add data to the actor sheet
        for (const itemType in CONFIG.NOVA6.itemClasses) {
            data = CONFIG.NOVA6.itemClasses[itemType].getActorSheetData(data, this);
        }

        // Custom sheet listeners for every SheetComponent
        for (const sheetComponent in CONFIG.NOVA6.sheetComponents.actor) {
            data = CONFIG.NOVA6.sheetComponents.actor[sheetComponent].getSheetData(data, this);
        }

        return data;
    }

    /**
     * Adds NOVA6 specific buttons to the sheets header bar.
     *
     * @returns Application.HeaderButton[]
     *   A list of buttons to be rendered.
     */
    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();

        // Edit mode button to toggle which interactive elements are visible on the sheet.
        const canConfigure = game.user?.isGM || this.actor.isOwner;

        if (this.options.editable && canConfigure) {
            // noinspection JSUnusedGlobalSymbols
            buttons.unshift({
                class: "nova6-toggle-edit-mode",
                label: game.i18n.localize("NOVA.Sheet.Buttons.EditMode"),
                icon: "fas fa-edit",
                onclick: (e: JQuery.ClickEvent) => this._onToggleEditMode(e),
            });
        }

        return buttons;
    }

    /**
     * OnClick handler for the previously declaried "Edit mode" button.
     * Toggles the 'nova6-js-edit-mode' class for the sheet container.
     */
    _onToggleEditMode(e: JQuery.ClickEvent): void {
        e.preventDefault();

        const target = $(e.currentTarget);
        const app = target.parents(".app");
        const html = app.find(".window-content");

        html.toggleClass("nova6-js-edit-mode");
    }

    /**
     * Saves and restores the focus of a child element
     * This is needed because FVTT only handles this for inputs that belong to the form itself
     *
     * @param force
     * @param options
     */
    async _render(force, options) {
        // Identify the focused element and save its caret position
        const focusedElement: string = this.element.find(":focus").data("focus-id");
        const selection = window.getSelection();
        const position = selection?.focusOffset ?? 0;

        // Render the application
        await super._render(force, options);

        // Restore focus and caret position
        if (focusedElement) {
            const element = this.element.find(`[data-focus-id=${focusedElement}]`)[0];
            const range = document.createRange();
            range.setStart(element.childNodes[0], position);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
            element.focus();
        }
    }
}
