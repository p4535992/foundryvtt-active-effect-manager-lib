/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */
// Import TypeScript modules
import { registerSettings } from "./scripts/settings";
import CONSTANTS from "./scripts/constants";
import { debug, dialogWarning, error, log, capitalizeFirstLetter } from './scripts/lib/lib';
import { initHooks, readyHooks, setupHooks } from "./scripts/module";
import API from "./scripts/api";
import {
	filterStatusButtons,
	findAllStatusEffectButtons,
	findEffectsButton,
	findStatusEffectButtonsContainingSearchTerm,
	isPF2E
} from "./scripts/effects/effect-quick-status";

declare global {
  var Hooks: {
    on: any;
    once: any;
  };
  var Application: any;
  var foundry: any;
  var canvas: any;
  var game: any;
  var CONFIG: any;
  var CONST: any;
  var ActiveEffect: any;
  var ui: any;
}

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once("init", function () {
	log(" init " + CONSTANTS.MODULE_NAME);
	// Assign custom classes and constants here

	// Register custom module settings
	registerSettings();

	// Preload Handlebars templates
	// preloadTemplates();

	// Register custom sheets (if any)
	initHooks();
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
	setupHooks();
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", function () {
	if (!game.modules.get("lib-wrapper")?.active && game.user?.isGM) {
		let word = "install and activate";
		if (game.modules.get("lib-wrapper")) word = "activate";
		throw error(`Requires the 'libWrapper' module. Please ${word} it.`);
	}
	if (!game.modules.get("socketlib")?.active && game.user?.isGM) {
		let word = "install and activate";
		if (game.modules.get("socketlib")) word = "activate";
		throw error(`Requires the 'socketlib' module. Please ${word} it.`);
	}

	// if (!isGMConnected()) {
	//   warn(`Requires a GM to be connected for players to be able to loot item piles.`, true);
	// }

	// Do anything once the module is ready
	readyHooks();
});

Hooks.once("canvasReady", async () => {
	if (game.settings.get(CONSTANTS.MODULE_NAME, "enableQuickStatusEffect")) {
		//debug('got canvas ready hook!', game, canvas);
		let user = game.user;
		if (!user) {
			throw error(`No user found.`);
		}

		Hooks.on("renderTokenHUD", async (app, html, token) => {
			const statusEffects = $(document).find(".status-effects");
			let inputString = "";
			if (isPF2E()) {
				inputString =
					'<input class="active-effect-manager-lib-quick-input-pf2e" id="active-effect-manager-lib-quick-input" type="text" placeholder="filter conditions..." ></input>';
			} else {
				inputString =
					'<input class="active-effect-manager-lib-quick-input" id="active-effect-manager-lib-quick-input" type="text" placeholder="filter conditions..." ></input>';
			}
			statusEffects.prepend(inputString);
			const qssQuickInput = $(document).find(
				".active-effect-manager-lib-quick-input, .active-effect-manager-lib-quick-input-pf2e"
			);
			qssQuickInput.on("keypress", (e) => {
				debug(`got keypress: ${e.key}, ${API.statusSearchTerm}`);
				if (e.key === "Enter" && !!API.statusSearchTerm) {
					// const searchTermTransformed = API.statusSearchTerm.trim().toLowerCase().capitalize();
                    const searchTermTransformed = capitalizeFirstLetter(API.statusSearchTerm.trim().toLowerCase());
					const allButtons = findAllStatusEffectButtons();
					const buttonsToShow = findStatusEffectButtonsContainingSearchTerm(
						allButtons,
						searchTermTransformed
					);
					const buttonToClick = buttonsToShow.first();
					debug(
						`detected Enter key while searching! ${searchTermTransformed}, ${buttonsToShow}, ${buttonToClick}`
					);
					debug("events: ", $.data(buttonToClick.children().first(), "events"));
					buttonToClick.children().first().trigger("click");
					const effectsButton = findEffectsButton();
					effectsButton.trigger("click");
				}
			});
			qssQuickInput.on("search", (e) => {
				debug("search event", e);
			});
			qssQuickInput.on("click", (e) => {
				debug("click: ", e);
				e.preventDefault();
				return false;
			});
			qssQuickInput.on("input", (e) => {
				API.statusSearchTerm = String(qssQuickInput.val()).toString();
				filterStatusButtons();
			});
			// bind to the click on the img tag because otherwise every click in the grid is handled.
			const effectsButton = findEffectsButton();
			debug("found effects button?: ", effectsButton);
			effectsButton.on("mouseup", (e) => {
				debug("effects button clicked, waiting to focus qssQuickInput");
				// wait 1 frame after the effects button is clicked because otherwise our input isn't on the dom yet.
				setTimeout(() => {
					qssQuickInput.focus();
				}, 0);
			});
		});
	}
});

/* ------------------------------------ */
/* Other Hooks							*/
/* ------------------------------------ */

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(CONSTANTS.MODULE_NAME);
});

export interface ActiveEffectManagerModuleData {
	api: typeof API;
	socket: any;
}

/**
 * Initialization helper, to set API.
 * @param api to set to game module.
 */
export function setApi(api: typeof API): void {
	const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as ActiveEffectManagerModuleData;
	data.api = api;
}

/**
 * Returns the set API.
 * @returns Api from games module.
 */
export function getApi(): typeof API {
	const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as ActiveEffectManagerModuleData;
	return data.api;
}

/**
 * Initialization helper, to set Socket.
 * @param socket to set to game module.
 */
export function setSocket(socket: any): void {
	const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as ActiveEffectManagerModuleData;
	data.socket = socket;
}

/*
 * Returns the set socket.
 * @returns Socket from games module.
 */
export function getSocket() {
	const data = game.modules.get(CONSTANTS.MODULE_NAME) as unknown as ActiveEffectManagerModuleData;
	return data.socket;
}
