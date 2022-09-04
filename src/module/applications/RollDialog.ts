import { SkillItemData } from "../item/ItemTypes";
import { NOVA6Actor } from "../actor/NOVA6Actor";

type RollDialogData = {
    skill: SkillItemData;
    rollData: RollData;
    perks: Perk[];
};

type Perk = {
    name: string;
    active: boolean;
};

type RollData = {
    baseDice: number;
    rank: number;
    bonus: number;
    penalty: number;
    activePerk: number;
    numberOfDice: number;
    availableTradeDice: number;
    forceTradeDice: number;
    usedTradeDice: number;
    status: "up" | "down" | "even";
};

export class RollDialog extends FormApplication<FormApplicationOptions, RollDialogData> {
    static baseDice = 3;

    actor: NOVA6Actor;
    skill: SkillItemData;
    rollData: RollData;
    perks: Perk[];

    constructor(actor: NOVA6Actor, skillData: SkillItemData, options?: Partial<ApplicationOptions>) {
        const rollData: RollData = {
            baseDice: RollDialog.baseDice,
            rank: skillData.data.rank,
            bonus: 0,
            penalty: 0,
            status: "even",
            activePerk: 0,
            usedTradeDice: 0,
            availableTradeDice: 0,
            forceTradeDice: 0,
            numberOfDice: 3,
        };

        super(rollData, options);

        this.rollData = rollData;
        this.actor = actor;
        this.skill = skillData;

        const defaultPerk = {
            name: game.i18n.localize("NOVA.Apps.RollSkill.NoPerk"),
            active: true,
        };

        this.perks = [
            defaultPerk,
            ...Object.entries(this.skill.data)
                .filter(([key, value]) => key.startsWith("perk") && value.trim().length)
                .map(([_key, value]) => ({ name: value, active: false })),
        ];

        this.calculateRollData();
    }

    static get defaultOptions() {
        const defaultRollDialogOptions: Partial<FormApplicationOptions> = {
            title: game.i18n.localize("NOVA.Apps.RollSkill.Title"),
            template: "/systems/nova6/templates/applications/roll-dialog.hbs",
            classes: ["nova6", "nova6-sheet", "nova6-roll-dialog", "sheet"],
            scrollY: [".nova6-desk__content"],
            width: 675,
            resizable: true,
            submitOnChange: true,
            closeOnSubmit: false,
        };

        return { ...super.defaultOptions, ...defaultRollDialogOptions };
    }

    getData(_options): RollDialogData {
        return {
            skill: this.skill,
            rollData: this.rollData,
            perks: this.perks,
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".nova6-js-execute-roll").click((e) => this._executeRoll.call(this, e));
        html.find(".nova6-js-sp-increment").click(() => this._changeStuntPoints.call(this, 2));
        html.find(".nova6-js-sp-decrement").click(() => this._changeStuntPoints.call(this, -2));
    }

    calculateRollData() {
        const activePerk = this.perks.findIndex((perk) => perk.active) > 0 ? 1 : 0;
        const bonusDice = this.rollData.rank + this.rollData.bonus + activePerk;
        const penaltyDice = this.rollData.penalty;

        const status = bonusDice - penaltyDice === 0 ? "even" : bonusDice - penaltyDice > 0 ? "up" : "down";
        const numberOfDice = RollDialog.baseDice + bonusDice + penaltyDice - this.rollData.usedTradeDice;
        const availableTradeDice = Math.floor((numberOfDice + this.rollData.usedTradeDice - 3) / 2) * 2;
        const forceTradeDice = Math.ceil(Math.max(numberOfDice - 7, 0) / 2) * 2;

        this.rollData.usedTradeDice = Math.clamped(this.rollData.usedTradeDice, 0, availableTradeDice);

        this.rollData = {
            ...this.rollData,
            status,
            activePerk,
            forceTradeDice,
            numberOfDice,
            availableTradeDice,
        };
    }

    async _updateObject(_event: Event, formData) {
        this.rollData = { ...this.rollData, ...formData };

        this.perks.forEach((perk, index) => {
            perk.active = formData["perk"] === index;
        });

        this.render();
    }

    render(force = false, options = {}) {
        this.calculateRollData();
        return super.render(force, options);
    }

    /*************************
     * EVENT HANDLER
     *************************/

    async _executeRoll(_event: JQuery.ClickEvent) {
        const roll = new Roll(`${this.rollData.numberOfDice}d6${this.rollData.status === "up" ? "kh3" : "kl3"}`).roll({
            async: false,
        });

        const chatData = {
            user: game.user?.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            sound: CONFIG.sounds.dice,
            roll: roll,
            rollMode: game.settings.get("core", "rollMode"),
        };

        await ChatMessage.create(chatData);

        this.close();
    }

    _changeStuntPoints(change: number) {
        this.rollData.usedTradeDice = Math.clamped(
            this.rollData.usedTradeDice + change,
            0,
            this.rollData.availableTradeDice
        );

        this.render();
    }
}
