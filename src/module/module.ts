import { registerSocket, activeEffectManagerSocket } from "./socket";

import CONSTANTS from "./constants";
import { debug, drawShyEffects, error, i18n, i18nFormat, warn } from "./lib/lib";
import API from "./api";
import EffectInterface from "./effects/effect-interface";
import StatusEffects from "./effects/status-effects";
import type StatusEffectsLib from "./effects/status-effects";
import { setApi } from "../active-effect-manager-lib";
import { DropEffectsOnItems } from "./effects/effect-drop-on-item";
import {
	filterStatusButtons,
	findAllStatusEffectButtons,
	findEffectsButton,
	findStatusEffectButtonsContainingSearchTerm,
	isPF2E,
} from "./effects/effect-quick-status";

export const initHooks = (): void => {
	// registerSettings();
	// registerLibwrappers();
	// new HandlebarHelpers().registerHelpers();

	Hooks.once("socketlib.ready", registerSocket);

	//@ts-ignore
	window.activeEffectManager = {
		API,
	};

	if (game.settings.get(CONSTANTS.MODULE_NAME, "enableShyEffectIcons")) {
		//@ts-ignore
		libWrapper.register(CONSTANTS.MODULE_NAME, "Token.prototype.drawEffects", drawShyEffects, "OVERRIDE");
	}
};

export const setupHooks = (): void => {
	//@ts-ignore
	window.activeEffectManager.API.effectInterface = new EffectInterface(CONSTANTS.MODULE_NAME);
	//@ts-ignore
	window.activeEffectManager.API.effectInterface.initialize();

	//@ts-ignore
	window.activeEffectManager.API.statusEffects = new StatusEffects();
	//@ts-ignore
	window.activeEffectManager.API.statusEffects.init();

	//@ts-ignore
	setApi(window.activeEffectManager.API);

	if (game.settings.get(CONSTANTS.MODULE_NAME, "enableStatusEffectNames")) {
		//@ts-ignore
		// libWrapper.register(CONSTANTS.MODULE_NAME, 'TokenHUD.prototype._onToggleEffect', function (wrapped, ...args) {
		//   const token = this.object;
		//   //@ts-ignore
		//   (<StatusEffectsLib>window.activeEffectManager.API.statusEffects).onToggleEffect(token, wrapped, args);
		//   // 'MIXED'
		// });

		libWrapper.register(CONSTANTS.MODULE_NAME, "TokenHUD.prototype._onToggleEffect", function (wrapper, ...args) {
			//@ts-ignore
			(<StatusEffectsLib>window.activeEffectManager.API.statusEffects).onToggleEffect({
				token: this.object,
				wrapper,
				args,
			});
		});

		//@ts-ignore
		libWrapper.register(
			CONSTANTS.MODULE_NAME,
			"TokenHUD.prototype._getStatusEffectChoices",
			function (wrapped, ...args) {
				const token = this.object;
				//@ts-ignore
				return (<StatusEffectsLib>window.activeEffectManager.API.statusEffects).getStatusEffectChoices(
					token,
					wrapped,
					args
				);
				// 'MIXED'
			}
		);

		//@ts-ignore
		libWrapper.register(
			CONSTANTS.MODULE_NAME,
			"TokenHUD.prototype.refreshStatusIcons",
			function (wrapped, ...args) {
				const tokenHud = <any>this;
				//@ts-ignore
				(<StatusEffectsLib>window.activeEffectManager.API.statusEffects).refreshStatusIcons(tokenHud);
				wrapped(...args);
			},
			"WRAPPER"
		);
	}

	if (game.settings.get(CONSTANTS.MODULE_NAME, "enableDropEffectsOnActors")) {
		//@ts-ignore
		libWrapper.register(
			CONSTANTS.MODULE_NAME,
			"ActorSheet.prototype._onDropActiveEffect",
			async function (wrapper, ...args) {
				const [, data] = args;
				if (!data.effectName) {
					wrapper(...args);
					return;
				} else {
					// NOTE: taken from _onDropActiveEffect
					//@ts-ignore
					const effect = await ActiveEffect.implementation.fromDropData(data);
					if (!this.actor.isOwner || !effect) return false;
					if (this.actor.uuid === effect.parent?.uuid) return false; // NOTE: Modified to include optional
					return ActiveEffect.create(effect.toObject(), { parent: this.actor });
				}
			}
		);
	}
};

export const readyHooks = (): void => {
	// checkSystem();
	// registerHotkeys();
	// Hooks.callAll(HOOKS.READY);

	if (game.settings.get(CONSTANTS.MODULE_NAME, "enableDropEffectsOnItems")) {
		DropEffectsOnItems.init();
	}

	if (game.settings.get(CONSTANTS.MODULE_NAME, "enableQuickStatusEffect")) {
		Hooks.once("canvasReady", async () => {
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
						const searchTermTransformed = API.statusSearchTerm.trim().toLowerCase().capitalize();
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
		});
	}
};
