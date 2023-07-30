/**
 * he official NOVA6 game system for FoundryVTT, based on the TTRPG from Legendsmiths
 *
 * Author: Patrick Bauer (Daddi#2333)
 * Repository: https://github.com/Legendsmiths-LLC/NOVA6-fvtt
 * Software License: MIT#
 * Content License:
 *      Original material for NOVA6 is derived from the Fate Core System. Work based on Fate Core System
 *      and Fate Accelerated Edition (found at http://www.faterpg.com/), products of Evil Hat Productions, LLC,
 *      developed, authored, and edited by Leonard Balsera, Brian Engard, Jeremy Keller, Ryan Macklin,
 *      Mike Olson, Clark Valentine, Amanda Valentine, Fred Hicks, and Rob Donoghue, and licensed for
 *      our use under the  Open Game License v 1.0 Copyright 2000, Wizards of the Coast, Inc.(NOVA6 OGL).
 */

import "./styles/nova6.scss";

import { NOVA6 } from "./config";
import { NOVA6Actor } from "./module/actor/NOVA6Actor";
import { CharacterSheet } from "./module/actor/CharacterSheet";
import { HandlebarsHelpers } from "./module/helper/HandlebarsHelpers";
import { TemplatePreloader } from "./module/helper/TemplatePreloader";
import { NOVA6Item } from "./module/item/NOVA6Item";
import { NOVA6Settings } from "./module/helper/Settings";
import { AspectSheet } from "./module/item/aspect/AspectSheet";
import { SkillSheet } from "./module/item/skill/SkillSheet";
import { AssetSheet } from "./module/item/asset/AssetSheet";
import { TalentSheet } from "./module/item/talent/TalentSheet";
import { StressSheet } from "./module/item/stress/StressSheet";
import { novaModifier } from "./module/applications/RollDialog";
import { RollConfig } from "./module/features/RollConfig";

/* -------------------------------- */
/*	System initialization			*/
/* -------------------------------- */
Hooks.once("init", async () => {
    console.log(`NOVA6 | Initializing game system | Legendsmiths, LLC`);

    // Initialise config
    CONFIG.NOVA6 = NOVA6;

    CONFIG.Actor.documentClass = NOVA6Actor;
    CONFIG.Item.documentClass = NOVA6Item;

    // Register generic system settings
    NOVA6Settings.registerSettings();

    // Register HandlebarsHelpers
    HandlebarsHelpers.registerHelpers();

    // Set initiative roll
    CONFIG.Combat.initiative.formula = "1d20";

    //Register new die modifier
    Die.MODIFIERS["nova"] = novaModifier;
    Die.MODIFIERS["novadown"] = novaModifier;

    // Unregister Core sheets
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // Register NOVA6 actor sheets
    Actors.registerSheet("NOVA6", CharacterSheet, {
        types: ["character"],
        makeDefault: true,
    });

    Items.registerSheet("NOVA6", AspectSheet, {
        types: ["aspect"],
        makeDefault: true,
    });

    Items.registerSheet("NOVA6", SkillSheet, {
        types: ["skill"],
        makeDefault: true,
    });

    Items.registerSheet("NOVA6", AssetSheet, {
        types: ["asset"],
        makeDefault: true,
    });

    Items.registerSheet("NOVA6", TalentSheet, {
        types: ["talent"],
        makeDefault: true,
    });

    Items.registerSheet("NOVA6", StressSheet, {
        types: ["stress"],
        makeDefault: true,
    });

    // Preload all needed templates
    await TemplatePreloader.preloadHandlebarsTemplates();
});

/* -------------------------------- */
/*	Register hooks      			*/
/* -------------------------------- */
RollConfig.hooks();

/* -------------------------------- */
/*	Webpack HMR                     */
/* -------------------------------- */
if (module.hot) {
    module.hot.accept();

    if (module.hot.status() === "apply") {
        for (const template in _templateCache) {
            if (Object.prototype.hasOwnProperty.call(_templateCache, template)) {
                delete _templateCache[template];
            }
        }

        TemplatePreloader.preloadHandlebarsTemplates().then(() => {
            for (const application in ui.windows) {
                if (Object.prototype.hasOwnProperty.call(ui.windows, application)) {
                    ui.windows[application].render(true);
                }
            }
        });
    }
}
