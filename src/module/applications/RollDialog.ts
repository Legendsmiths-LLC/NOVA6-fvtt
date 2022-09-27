import { SkillItemData } from "../item/ItemTypes";
import { NOVA6Actor } from "../actor/NOVA6Actor";
import { ItemDataBaseProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";

type RollDialogData = {
    skill: SkillItemData;
    rollData: RollData;
    perks: Perk[];
    talents: Talent[];
    allowInstantSuccess: boolean;
};

type Perk = {
    name: string;
    active: boolean;
};

type Talent = {
    name: string;
    active: boolean;
};

type RollData = {
    baseDice: number;
    rank: number;
    bonus: number;
    penalty: number;
    setbacks: number;
    activePerk: number;
    freeStuntPoints: number;
    numberOfDice: number;
    availableTradeDice: number;
    forceTradeDice: number;
    usedTradeDice: number;
    talent: number;
    status: "up" | "down" | "even";
};

export function novaModifier(modifier: string) {
    //Remove all rerolled dice
    this.results = this.results.filter((result) => !result.rerolled);

    // Only check for winning triples/doubles if the roll is up
    if (modifier === "nova") {
        const faces: number[] = this.results.map((result) => result.result).sort((a, b) => b - a);

        //Check for triples
        for (const number of new Set(faces)) {
            const isTriple = faces.filter((face) => face === number).length >= 3;

            if (isTriple && number * 3 > 10) {
                let marked = 0;

                this.results = this.results.map((result) => {
                    if (marked < 3 && result.result === number) {
                        result.discarded = false;
                        marked++;
                    } else {
                        result.discarded = true;
                    }

                    result.active = !result.discarded;

                    return result;
                });

                this.hasTriples = true;
                return;
            }
        }

        //Check for doubles
        for (const number of new Set(faces)) {
            const isDouble = faces.filter((face) => face === number).length >= 2;
            const highestOtherFace = faces.filter((face) => face !== number)[0];

            if (isDouble && number * 2 + highestOtherFace > 10) {
                let markedHighest = false;
                let marked = 0;

                this.results = this.results.map((result) => {
                    result.discarded = true;

                    if (marked < 2 && result.result === number) {
                        result.discarded = false;
                        marked++;
                    }

                    if (result.result === highestOtherFace && !markedHighest) {
                        result.discarded = false;
                        markedHighest = true;
                    }

                    result.active = !result.discarded;

                    return result;
                });

                this.hasDoubles = true;
                return;
            }
        }
    }

    // @ts-ignore
    this.results = DiceTerm._keepOrDrop(this.results, 3, { keep: true, highest: modifier === "nova" });

    // Check action dice for triples/doubles
    const actionDiceSet = new Set([
        ...this.results.filter((result) => result.discarded !== true).map((result) => result.result),
    ]);

    if (actionDiceSet.size === 1) {
        this.hasTriples = true;
    }

    if (actionDiceSet.size === 2) {
        this.hasDoubles = true;
    }
}

export class RollDialog extends FormApplication<FormApplicationOptions, RollDialogData> {
    static baseDice = 3;

    actor: NOVA6Actor;
    skill: SkillItemData & ItemDataBaseProperties;
    rollData: RollData;
    perks: Perk[];
    talents: Talent[];

    constructor(
        actor: NOVA6Actor,
        skillData: SkillItemData & ItemDataBaseProperties,
        options?: Partial<ApplicationOptions>
    ) {
        const rollData: RollData = {
            baseDice: RollDialog.baseDice,
            rank: skillData.system.rank,
            bonus: 0,
            penalty: 0,
            setbacks: 0,
            status: "even",
            activePerk: 0,
            freeStuntPoints: 0,
            usedTradeDice: 0,
            availableTradeDice: 0,
            forceTradeDice: 0,
            talent: 0,
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
            ...Object.entries(this.skill.system)
                .filter(([key, value]) => key.startsWith("perk") && value.trim().length)
                .map(([_key, value]) => ({ name: value, active: false })),
        ];

        this.talents = this.getAvailableTalents();

        this.calculateRollData();
    }

    getAvailableTalents() {
        const actorTalents = this.actor.items.filter((item) => item.type === "talent");
        const possibleTalents = [
            "Focused",
            "Specialized",
            "Practiced",
            "Resolute",
            "Strong Body",
            "Strong Personality",
            "Tough",
        ];

        const talents = possibleTalents.filter((talent) => {
            switch (talent) {
                case "Focused":
                    return this.skill.system.focused;
                case "Specialized":
                    return this.skill.system.specialized;
                case "Practiced":
                    return this.skill.system.practiced;
                case "Resolute":
                    return this.skill.name === "Resolve" && actorTalents.find((item) => item.name === talent);
                case "Strong Body":
                    return this.skill.name === "Physique" && actorTalents.find((item) => item.name === talent);
                case "Strong Personality":
                    return this.skill.name === "Interact" && actorTalents.find((item) => item.name === talent);
                case "Tough":
                    return this.skill.name === "Physique" && actorTalents.find((item) => item.name === talent);
                default:
                    return actorTalents.find((item) => item.name === talent);
            }
        });

        return talents.map((talent) => {
            return {
                name: talent,
                active: false,
            };
        });
    }

    static get defaultOptions() {
        const defaultRollDialogOptions: Partial<FormApplicationOptions> = {
            title: game.i18n.localize("NOVA.Apps.RollSkill.Title"),
            template: "/systems/nova6/templates/applications/roll-dialog.hbs",
            classes: ["nova6", "nova6-sheet", "nova6-roll-dialog", "sheet"],
            scrollY: [".nova6-desk__content"],
            width: 775,
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
            talents: this.talents,
            allowInstantSuccess:
                !!this.talents.find((talent) => talent.name === "Practiced" && talent.active) &&
                this.rollData.status === "up",
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".nova6-js-execute-roll").click((e) => this._executeRoll.call(this, e));
        html.find(".nova6-js-instant-success").click((e) => this._instantSuccess.call(this, e));
        html.find(".nova6-js-sp-increment").click(() => this._changeStuntPoints.call(this, 2));
        html.find(".nova6-js-sp-decrement").click(() => this._changeStuntPoints.call(this, -2));
    }

    calculateTalentBonus() {
        return this.talents
            .filter((talent) => talent.active)
            .reduce((acc, talent) => {
                switch (talent.name) {
                    case "Specialized":
                        return acc - 1;
                    case "Resolute":
                        return acc + 1;
                    case "Strong Body":
                        return acc + 1;
                    case "Strong Personality":
                        return acc + 1;
                    case "Tough":
                        return acc + 1;
                    default:
                        return acc;
                }
            }, 0);
    }

    calculateRollData() {
        const talent = this.calculateTalentBonus();
        const activePerk = this.perks.findIndex((perk) => perk.active) > 0 ? 1 : 0;

        const bonusDice = this.rollData.rank + this.rollData.bonus + activePerk + talent;
        const penaltyDice = this.rollData.penalty + this.rollData.setbacks;

        const status = bonusDice - penaltyDice === 0 ? "even" : bonusDice - penaltyDice > 0 ? "up" : "down";

        let numberOfDice = RollDialog.baseDice + Math.abs(bonusDice - penaltyDice) - this.rollData.usedTradeDice;
        const availableTradeDice = Math.abs(Math.floor((numberOfDice + this.rollData.usedTradeDice - 3) / 2) * 2);
        const forceTradeDice = Math.ceil(Math.max(numberOfDice - 7, 0) / 2) * 2;

        //Recalculate number of dice
        const usedTradeDice = Math.clamped(this.rollData.usedTradeDice, 0, availableTradeDice);
        numberOfDice = RollDialog.baseDice + Math.abs(bonusDice - penaltyDice) - usedTradeDice;

        this.rollData = {
            ...this.rollData,
            status,
            activePerk,
            forceTradeDice,
            numberOfDice,
            availableTradeDice,
            talent,
            usedTradeDice,
        };
    }

    async _updateObject(_event: Event, formData) {
        this.rollData = { ...this.rollData, ...formData };

        this.perks.forEach((perk, index) => {
            perk.active = formData["perk"] === index;
        });

        this.talents.forEach((talent, index) => {
            talent.active = [formData["talent"]].deepFlatten().includes(index);
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
        const modifiers = Object.entries({
            r1: !!this.talents.find((talent) => talent.name === "Practiced" && talent.active),
            nova: this.rollData.status === "up",
            novadown: this.rollData.status !== "up",
        })
            .filter(([, condition]) => condition)
            .map(([name]) => name) as (keyof Die.Modifiers)[];

        const formula = new Die({ number: this.rollData.numberOfDice, faces: 6, modifiers }).expression;
        const roll = new Roll(formula).roll({ async: false });

        const success = roll.total > 10;

        const templateData = {
            skill: this.skill,
            rollData: this.rollData,
            skillPoints: 0,
            roll: roll.dice[0],
            success,
            ...roll.dice[0].getTooltipData(),
        };

        const content = await renderTemplate("systems/nova6/templates/chat/roll.hbs", templateData);

        const chatData = {
            user: game.user?.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            sound: CONFIG.sounds.dice,
            roll: roll,
            flavor: `${this.skill.name}`,
            rollMode: game.settings.get("core", "rollMode"),
            content,
        };

        await ChatMessage.create(chatData);
        //this.close();
    }

    async _instantSuccess(_event: JQuery.ClickEvent) {
        const chatData = {
            user: game.user?.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: `<p>Chose instant success</p>`,
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
