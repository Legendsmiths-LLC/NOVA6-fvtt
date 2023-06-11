Hooks.once("init", async function () {
    const layers = { nova6: { layerClass: Nova6Layer, group: "primary" } }
    CONFIG.Canvas.layers = foundry.utils.mergeObject(Canvas.layers, layers);


    // register helper to check if an aspect has a default description
    // @ts-ignore
    Handlebars.registerHelper('isDefaultAspect', function(item) {
        // @ts-ignore
        return CONFIG.NOVA6.aspectDescriptions.includes(item.system.description)
    });
});

Hooks.once("ready", async function () {
    // we need to store our default aspect item descriptions in a place
    // we can access without the use of async functions

    // @ts-ignore
    await game.packs.loaded;
    
    const aspectPack = game.packs.find(p => p.collection === "nova6.aspects")
    // @ts-ignore
    const aspectPackData = await aspectPack.getIndex();
    const descriptions = await Promise.all(aspectPackData.map(async (entry) => {
        // @ts-ignore
        const document = await aspectPack.getDocument(entry._id);
        // @ts-ignore
        return document.system.description;
    }));

    // @ts-ignore
    CONFIG.NOVA6.aspectDescriptions = descriptions;
});

Hooks.on('getSceneControlButtons', (buttons) => {
    // @ts-ignore
    if(game.user.isGM) {
        const nova6Tool = {
            activeTool: "gmscreen",
            icon: "icon-nova6",
            layer: "nova6",
            name: "nova6",
            title: game.i18n.localize("NOVA.name"),
            tools: [],
            visible: true
        }

        // gm-screen
        // @ts-ignore
        nova6Tool.tools.push({
            // @ts-ignore
            name: "gmscreen",
            // @ts-ignore
            icon: "icon-gmscreen",
            // @ts-ignore
            title: game.i18n.localize("NOVA.GmScreen.GmScreen"),
            // @ts-ignore
            button: true,
            // @ts-ignore
            onClick: () => { Nova6GMScreen.Nova6GMScreenForm?.render(true, {}) },
        })

        buttons.push(nova6Tool)
    }
})

// @ts-ignore
export class Nova6Layer extends PlaceablesLayer {
    constructor(...args) {
        // @ts-ignore
        super(...args);

        // @ts-ignore
        this.documentName = "Scene"

        // @ts-ignore
        this.isSetup = false;
    }

    static get layerOptions() {
        return foundry.utils.mergeObject(super.layerOptions, {
            zIndex: 180,
            name: "nova6"
        });
    }
  
    getDocuments() {
        return []
    }

    // @ts-ignore
    activate() {
        super.activate();
    }

    deactivate() {
        super.deactivate();
    }

    render(...args) {
        // @ts-ignore
        super.render(...args);
    }
}

export class Nova6GMScreen {
    static Nova6GMScreenForm: Nova6GMScreenForm

    static initialize() {
        this.Nova6GMScreenForm = new Nova6GMScreenForm({}, undefined)

        loadTemplates([
            "systems/nova6/templates/gm-screen/stress-box-partial.hbs"
        ]);

        Handlebars.registerHelper('range', function(start: any, end: any, options: any) {
            let ret = '';
            for (let i = start; i <= end-1; i++) {
                ret = ret + options.fn(i, { data: { ...options.data, index: i } });
            }
            return ret;
        });

        Handlebars.registerHelper('getValueAtIndex', function(array: any, index: any) {
            if (array === undefined || index > array.length) return "C";

            return array[index];
        });

        Hooks.on("updateActor", () => {
            this.Nova6GMScreenForm?.render();
        });

        Hooks.on("updateItem", () => {
            this.Nova6GMScreenForm?.render();
        });
    }

    static TEMPLATES: {[key: string]: string} = {
        Nova6GMScreenForm: "./systems/nova6/templates/gm-screen/gm-screen.hbs",
        Nova6GMScreenStressForm: "./systems/nova6/templates/gm-screen/stress-form.hbs"
    }

    static ID = "nova6gmscreen"
}

export class Nova6GMScreenData {
    static getPlayerActorData() {
        return game?.actors?.filter((e) => e.hasPlayerOwner).map((actor) => {
            const aspects = actor.items.filter((item) => {
                return item.type === 'aspect';
            });
            const stresses =  actor.items.filter((item) => {
                return item.type === 'stress';
            });
            return {
                ...actor.toObject(),
                aspects: aspects.map((aspect) => aspect.toObject()),
                stresses: stresses.map((stress) => stress.toObject())//,
            }
        })
    }
}

export class Nova6GMScreenForm extends FormApplication {
    static get defaultOptions() {
        const template = Nova6GMScreen.TEMPLATES.Nova6GMScreenForm

        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            width: 1410,
            id: Nova6GMScreen.ID,
            template: template,
            title: game.i18n.localize("NOVA.GmScreen.GmScreen"),
            userId: game.userId,
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
            resizable: true,
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    getData() {
        const data = super.getData()

        const actors = Nova6GMScreenData.getPlayerActorData()

        const stressDurations =  ["C","B","Q","S","T","L","LL","E","P"]

        const expandedStressDurations = stressDurations.map((duration) => ({
            duration,
            label: game.i18n.localize(`NOVA.Item.Stress.Durations.${duration}`),
        }));

        const newData: any = {
            data,
            actors,
            stressTypes: ['Physical', 'Mental'],
            stressSeverities: ['Stressed', 'Staggered', 'Incapacitated'],
            stressDurations: expandedStressDurations
        }

        return newData
    }

    async _updateObject(_) { 
        this.render()
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', '[data-action]', this._handleButtonClick.bind(this));
        html.find(".nova6-js-aspect-checkbox").click((e) => this._aspectToggle.call(this, e));
        html.find(".nova6-stress__selector").click((e) => this._stressSelector.call(this, e));

        // @ts-ignore
        game.socket?.on('system.nova6', (options) => {
            switch(options?.type) {
                case 'update':
                    this.render()

                    break;
                default:
                    console.log('unidentified socket type')
                    break;
            }
        })
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

        const actors = Nova6GMScreenData.getPlayerActorData()

        switch (action) {
            case ('reset-aspects'): {
                this.clearAspectsAll(actors)

                break;
            }

            case ('reset-aspects-one'): {
                this.clearAspectsOne(event, actors)

                break;
            }

            case ('reset-stress'): {
                const formData = await stressForm()
                // @ts-ignore
                const stressLevel = formData['stresslevel']

                this.clearStressAll(actors, stressLevel);

                break;
            }

            case ('reset-stress-one'): {
                const formData = await stressForm()
                // @ts-ignore
                const stressLevel = formData['stresslevel']

                this.clearStressOne(event, actors, stressLevel);

                break;
            }

            default: {
                break;
            }
        }

        this.render()

        this.sendUpdateSocket()
    }

    async clearAspectsAll(actors) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, actor] of Object.entries(actors)) {
            await this.clearAspectsActor(actor)
        }

        this.render()
    }

    async clearAspectsOne(event, actors) {
        const clickedElement = $(event.currentTarget);
        const actorId = clickedElement.closest('[data-actor-id]').data().actorId

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, actor] of Object.entries(actors)) {
            // @ts-ignore
            if (actor._id === actorId) {
                await this.clearAspectsActor(actor)
            }
        }

        this.render()
    }

    async clearAspectsActor(actor: any) {
        const items = (actor as any).items

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, item] of Object.entries(items)) {
            if ((item as any)?.type === 'aspect') {
                // @ts-ignore
                const relvantActor = game?.actors?.get(actor?._id) as Actor | undefined;
                if (!relvantActor) { continue; };

                // @ts-ignore
                const relevantItem = relvantActor?.items?.get(item?._id) as Item | undefined;

                if (relevantItem) {
                    await relevantItem?.update({"system.invoked": false})
                }
            }
        }        
    }

    async clearStressAll(actors, stressLevel) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, actor] of Object.entries(actors)) {
            await this.clearStressActor(actor, stressLevel)
        }

        this.render()
    }

    async clearStressOne(event, actors, stressLevel) {
        const clickedElement = $(event.currentTarget);
        const actorId = clickedElement.closest('[data-actor-id]').data().actorId

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, actor] of Object.entries(actors)) {
            // @ts-ignore
            if (actor._id === actorId) {
                await this.clearStressActor(actor, stressLevel)
            }
        }

        this.render()
    }

    async clearStressActor(actor: any, stressLevel) {
        const items = (actor as any).items

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, item] of Object.entries(items)) {
            if ((item as any)?.type === 'stress') {

                // @ts-ignore
                const relvantActor = game?.actors?.get(actor?._id) as Actor | undefined;
                if (!relvantActor) { continue; };

                // @ts-ignore
                const relevantItem = relvantActor?.items?.get(item?._id) as Item | undefined;

                if (relevantItem) {
                    const clearKeys = await this.getAllStressKeys(relevantItem, 'C', stressLevel)
                    await relevantItem?.update(clearKeys)
                }
            }
        }

        this.render()
    }

    async getAllStressKeys(relevantItem: any, newKey: string, stressLevel): Promise<{ [key: string]: string }> {
        const stressTypes: string[] = ["Physical", "Mental"];
        const stressSeverities: string[] = ["Stressed", "Staggered", "Incapacitated"];

        const clearKeys: { [key: string]: string } = {};

        // @ts-ignore
        const stressDurations =  ["C","B","Q","S","T","L","LL","E","P"]
        const stressLevelToClear = stressDurations.indexOf(stressLevel)

        for(let stressIndex = 0; stressIndex < stressTypes.length; stressIndex++) {
            for(let severityIndex = 0; severityIndex < stressSeverities.length; severityIndex++) {
                const stressData = relevantItem.system[stressTypes[stressIndex]][stressSeverities[severityIndex]]

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                for (const [key, _] of Object.entries(stressData)) {
                    const duration = relevantItem.system.status[stressTypes[stressIndex]][stressSeverities[severityIndex]][key]

                    // if stress level is already 'C' skip
                    if (Object.prototype.toString.call(duration) !== "[object String]") { continue; }

                    const thisStressLevel = stressDurations.indexOf(duration)

                    if (thisStressLevel > stressLevelToClear) {
                        continue;
                    }

                    clearKeys[`system.status.${stressTypes[stressIndex]}.${stressSeverities[severityIndex]}.${key}.status`] = newKey
                }
            }   
        }

        return clearKeys
    }

    async _aspectToggle(event) {
        const clickedElement = $(event.currentTarget);
        const itemId = clickedElement.data().itemId        
        const actorId = clickedElement.closest('[data-actor-id]').data().actorId

        const relevantItem = game?.actors?.get(actorId)?.items?.get(itemId)

        // @ts-ignore
        await relevantItem?.update({"system.invoked": !relevantItem?.system?.invoked})

        this.sendUpdateSocket()

        this.render()
    }

    // @ts-ignore
    async _stressSelector(event) {
        const durationSelector = event.currentTarget;
        const stressId = durationSelector.dataset.item;
        const stressType = durationSelector.dataset.type;
        const stressSeverity = durationSelector.dataset.severity;
        const boxIndex = durationSelector.dataset.index;
        const selectedDuration = event.target.dataset.duration;

        const clickedElement = $(event.currentTarget);
        const actorId = clickedElement.closest('[data-actor-id]').data().actorId

        const relevantActor = game.actors?.get(actorId)
        const relevantItem = relevantActor?.items.get(stressId)

        const update = {}
        update[`system.status.${stressType}.${stressSeverity}.${boxIndex}`] = selectedDuration

        await relevantItem?.update(update)

        this.render()

        this.sendUpdateSocket()
    }

    async sendUpdateSocket() {
        if (! game?.socket) { return; }

        game?.socket.emit('system.nova6', { type: 'update' })
    }
}

async function stressForm() {
	const templateData = {
		CONFIG
	};

	const content = await renderTemplate(Nova6GMScreen.TEMPLATES.Nova6GMScreenStressForm, templateData);

	const promise = new Promise(resolve => {
		const data = {
			title: game.i18n.localize("NOVA.GmScreen.Stress.RecoverStress"),
			content: content,
			buttons: {
				recoverStress: {
					label: game.i18n.localize("NOVA.GmScreen.Recover"),
					callback: html => {
                        const formData = new FormData(html[0].querySelector("form"));

                        const data = {};
                        // @ts-ignore
                        for (const [name, value] of formData.entries()) {
                            data[name] = value;
                        }                        

                        resolve(data);
                    }
				},
			},
			default: "recoverStress",
			close: () => resolve({})
		}

		new Dialog(data, { 'width': 200 }).render(true);;
	});

    return promise.then(formData => {
        return formData
    });
}