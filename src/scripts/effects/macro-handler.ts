import API from "../api";
import CONSTANTS from "../constants";
import { warn } from "../lib/lib";

/**
 * Handles creating macros
 */
export default class MacroHandler {
	/**
	 * Create a Macro from a Convenient Effect drop.
	 * Get an existing item macro if one exists, otherwise create a new one.
	 *
	 * @param {Object} data - the dropped data
	 * @param {number} slot - the hotbar slot to use
	 */
	async createMacro(data, slot) {
		if (!data.effectName) {
			warn(`No effect name is been found on object '${data}'`, true);
			return;
		}

		//@ts-ignore
		const effect = API.effects.all.find((effect) => effect.label === data.effectName);

		if (!effect) {
			warn(`No effect found with name '${data.effectName}'`, true);
			return;
		}
		const name = `Toggle Convenient Effect - ${effect.label}`;
		const command = `game.modules.get("${CONSTANTS.MODULE_ID}").api.effectInterface.toggleEffect("${effect.label}")`;
		//@ts-ignore
		let macro = <any>game.macros?.find((macro) => macro.name === name && macro.command === command);

		if (!macro) {
			macro = await Macro.create({
				name: name,
				type: "script",
				img: effect.icon,
				command: command,
			});
		}

		game.user?.assignHotbarMacro(macro, slot);

		return false;
	}
}
