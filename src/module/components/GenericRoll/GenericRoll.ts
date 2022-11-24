import { BaseComponent } from "../BaseComponent";
import { RollDialog } from "../../applications/RollDialog";

export class GenericRoll extends BaseComponent {
    static activateListeners(html, sheet) {
        html.find(".nova6-header__logo").click((e) => this._onRoll.call(this, e, sheet));
    }

    static _onRoll(e: JQuery.ClickEvent, sheet: ActorSheet) {
        e.preventDefault();
        new RollDialog(sheet.actor).render(true);
    }
}
