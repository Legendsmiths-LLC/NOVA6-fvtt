Hooks.on("init", () => {
    loadTemplates([
        "systems/nova6/templates/applications/stress-box-partial.hbs"
    ]);
})

Hooks.once("ready", () => {
    Nova6GMScreen.initialize()

    game.socket.on('system.nova6', ( options ) => {
        switch(options.type) {
            case 'update':
                console.log('update called!')

                break;
            default:
                break;
        }
    });
});

Hooks.on("updateActor", () => {
    Nova6GMScreen.Nova6GMScreenForm.render();
});

Hooks.on("getSceneControlButtons", (controls) => {
    if(!game.user.isGM) { return; }

    controls[0].tools.push({
        name: game.i18n.localize("gmsreen.gmscreen"),
        title: game.i18n.localize("gmsreen.gmscreen"),
        icon: 'far fa-dice',
        button: true,
        onClick: () => {
            Nova6GMScreen.Nova6GMScreenForm.render(true, {})
        },
    })
});

class Nova6GMScreen {
    static initialize() {
        this.Nova6GMScreenForm = new Nova6GMScreenForm()

        Handlebars.registerHelper('range', function(start, end, options) {
            var ret = '';
            for (var i = start; i <= end-1; i++) {
                ret = ret + options.fn(i);
            }
            return ret;
        });

        Handlebars.registerHelper('getValueAtIndex', function(array, index) {
            if (array === undefined || index > array.length) return "C";

            return array[index];
        });
    }

    static TEMPLATES = {
        Nova6GMScreenForm: "./systems/nova6/templates/applications/gm-screen.hbs"
    }

    static ID = "nova6gmscreen"
}

class Nova6GMScreenData {
    static getPlayerActorData() {
        return game.actors.filter((e) => e.hasPlayerOwner).map((actor) => {
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

class Nova6GMScreenForm extends FormApplication {
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

    getData(options) {
        const data = super.getData(options)

        const actors = Nova6GMScreenData.getPlayerActorData()

        return {
            data,
            actors,
            stressTypes: ['Physical', 'Mental'],
            stressSeverities: ['Stressed', 'Staggered', 'Incapacitated'],
            stressDurations: ["C","B","Q","S","T","L","LL","E","P"]
        }
    }

    async _updateObject(event, formData) { 
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

        game.socket.emit('system.nova6', { type: 'update' })

        this.render()
    }

    async clearAspects(actors) {
        for (const [actorKey, actor] of Object.entries(actors)) {
            const items = actor.items

            for (const [itemKey, item] of Object.entries(items)) {
                if (item.type === 'aspect') {
                    await game.actors.get(actor._id).items.get(item._id).update({"system.invoked": false})
                }
            }
        }

        this.render()
    }

    async clearStressAll(actors) {
        for (const [actorKey, actor] of Object.entries(actors)) {
            await this.clearStressActor(actor)
        }

        this.render()
    }

    async clearStressActor(actor) {
        const items = actor.items

        for (const [itemKey, item] of Object.entries(items)) {
            if (item.type === 'stress') {
                const relevantItem = game.actors.get(actor._id).items.get(item._id)

                const clearKeys = await this.getAllStressKeys(relevantItem, 'C')

                await relevantItem.update(clearKeys)
            }
        }
    }

    async getAllStressKeys(relevantItem, newKey) {
        const stressTypes = ["Physical", "Mental"];
        const stressSeverities = ["Stressed", "Staggered", "Incapacitated"];

        let clearKeys = [];

        for(let stressIndex = 0; stressIndex < stressTypes.length; stressIndex++) {
            for(let severityIndex = 0; severityIndex < stressSeverities.length; severityIndex++) {
                const stressData = relevantItem.system[stressTypes[stressIndex]][stressSeverities[severityIndex]]

                for (const [key, value] of Object.entries(stressData)) {
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

        const relevantItem = game.actors.get(actorId).items.get(itemId)

        await relevantItem.update({"system.invoked": !relevantItem.system.invoked})

        game.socket.emit('system.nova6', { type: 'update' })

        this.render()
    }
}