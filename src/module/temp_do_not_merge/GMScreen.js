Hooks.on("init", () => {
    loadTemplates([
        "systems/nova6/templates/applications/stress-box-partial.hbs"
    ]);
})

Hooks.once("ready", () => {
    Nova6GMScreen.initialize()

    // game.socket.on(ComplexRoll.SOCKET, ( options ) => {
    //     switch(options.type) {
    //         case 'results':
    //             if (options.complexRollId in ComplexRollData.getComplexRollsForUser(game.userId)) {
    //                 ComplexRoll.complexRollForm.updateResults(options)
    //             }
    //             break;
    //         case 'update':
    //             ComplexRoll.complexRollForm.render(true, {})

    //             break;
    //         default:
    //             ComplexRoll.log(true, "unknown socket event " + options.type)
    //             break;
    //     }
    // });
});

// Hooks.on('renderPlayerList', (playerList, html) => {
//     // find the element which has our logged in user's id
//     const loggedInUserListItem = html.find(`[data-user-id="${game.userId}"]`)
    
//     // insert a button at the end of this element
//     loggedInUserListItem.append(
//       "<button type='button' class='todo-list-icon-button'><i class='fas fa-tasks'></i></button>"
//     );
//   });

Hooks.on("getSceneControlButtons", (controls) => {
    if(!game.user.isGM) { return; }

    console.log(controls)

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
            const stressDurations = actor.items.filter((item) => {
                if ((item.type) === 'stress') {
                    console.log(item)
                }
            });
            return {
                ...actor.toObject(),
                aspects: aspects.map((aspect) => aspect.toObject()),
                stresses: stresses.map((stress) => stress.toObject())//,
                // stressTypes: ['Physical', 'Mental'],
                // stressSeverities: ['Stressed', 'Staggered', 'Incapacitated'],
                // stressDurations: ["C","B","Q","S","T","L","LL","E","P"]
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
        const expandedData = foundry.utils.expandObject(formData);

        // await ComplexRollData.updateManyComplexRolls(this.options.userId, expandedData);

        this.render()
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', '[data-action]', this._handleButtonClick.bind(this));
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;
        // const complexRollId = clickedElement.parents('[data-complex-roll-id]')?.data()?.complexRollId;

    }
}