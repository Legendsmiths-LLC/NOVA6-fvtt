// Hooks.on("init", () => {

// })

// Hooks.once("ready", () => {
//     Nova6GMScreen.initialize()

//     if (! game?.socket) { return; }

//     game?.socket.on('system.nova6', ( options: { type: string } ) => {
//         switch(options!.type) {
//             case 'update':
//                 console.log('update called!')

//                 break;
//             default:
//                 break;
//         }
//     });
// });

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
                ret = ret + options.fn(i);
            }
            return ret;
        });

        Handlebars.registerHelper('getValueAtIndex', function(array: any, index: any) {
            if (array === undefined || index > array.length) return "C";

            return array[index];
        });

        Hooks.on("getSceneControlButtons", (controls) => {
            if(!game?.user?.isGM) { return; }
        
            controls[0].tools.push({
                name: game.i18n.localize("gmsreen.gmscreen"),
                title: game.i18n.localize("gmsreen.gmscreen"),
                icon: 'far fa-dice',
                button: true,
                onClick: () => {
                    Nova6GMScreen.Nova6GMScreenForm?.render(true, {})
                },
            })
        });

        Hooks.on("updateActor", () => {
            this.Nova6GMScreenForm?.render();
        });
    }

    static TEMPLATES: {[key: string]: string} = {
        Nova6GMScreenForm: "./systems/nova6/templates/gm-screen/gm-screen.hbs"
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
            width: 1400,
            id: Nova6GMScreen.ID,
            template: template,
            title: "gmscreen.gmscreen",
            userId: game.userId,
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
            resizable: false,
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    getData() {
        const data = super.getData()

        const actors = Nova6GMScreenData.getPlayerActorData()

        const newData: any = {
            data,
            actors,
            stressTypes: ['Physical', 'Mental'],
            stressSeverities: ['Stressed', 'Staggered', 'Incapacitated'],
            stressDurations: ["C","B","Q","S","T","L","LL","E","P"]
        }

        return newData
    }

    async _updateObject(_) { 
        // const expandedData = foundry.utils.expandObject(formData);

        this.render()
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', '[data-action]', this._handleButtonClick.bind(this));
        html.find(".nova6-js-aspect-checkbox").click((e) => this._aspectToggle.call(this, e));
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

        const actors = Nova6GMScreenData.getPlayerActorData()

        switch (action) {
            case ('reset-aspects'): {
                this.clearAspects(actors)

                break;
            }
            case ('reset-stress'): {
                this.clearStressAll(actors)

                break;
            }
            default: {
                break;
            }
        }

        this.render()

        if (! game?.socket) { return; }

        game?.socket.emit('system.nova6', { type: 'update' })
    }

    async clearAspects(actors) {
        for (const [_, actor] of Object.entries(actors)) {
            const items = (actor as any).items

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

        this.render()
    }

    async clearStressAll(actors) {
        for (const [_, actor] of Object.entries(actors)) {
            await this.clearStressActor(actor)
        }

        this.render()
    }

    async clearStressActor(actor: any) {
        const items = actor.items

        for (const [_, item] of Object.entries(items)) {
            if (!item) { continue; }

            if ((item as any)?.type === 'stress') {
                const relvantActor = game?.actors?.get(actor?._id) as Actor | undefined;
                if (!relvantActor) { continue; };

                // @ts-ignore
                const relevantItem = relvantActor?.items?.get(item?._id) as Item | undefined;

                if (relevantItem) {
                    const clearKeys = await this.getAllStressKeys(relevantItem, 'C')
                    await relevantItem?.update(clearKeys)
                }
            }
        }
    }

    async getAllStressKeys(relevantItem: any, newKey: string): Promise<{ [key: string]: string }> {
        const stressTypes: string[] = ["Physical", "Mental"];
        const stressSeverities: string[] = ["Stressed", "Staggered", "Incapacitated"];

        const clearKeys: { [key: string]: string } = {};

        for(let stressIndex = 0; stressIndex < stressTypes.length; stressIndex++) {
            for(let severityIndex = 0; severityIndex < stressSeverities.length; severityIndex++) {
                const stressData = relevantItem.system[stressTypes[stressIndex]][stressSeverities[severityIndex]]

                for (const [key, _] of Object.entries(stressData)) {
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

        if (game?.socket) {
            game?.socket.emit('system.nova6', { type: 'update' })
        }

        this.render()
    }
}