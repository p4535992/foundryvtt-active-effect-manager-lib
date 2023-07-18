import type { StatusEffect } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/documents/token";
import API from "../api";
import CONSTANTS from "../constants";
import { i18n, isStringEquals } from "./effect-utility";
import type { StatusEffectInternal } from "./effect-models";
import { EffectSupport } from "./effect-support";

/**
 * Handles the status effects present on the token HUD
 */
export default class StatusEffectsLib {
	/**
	 * Initialize the token status effects based on the user configured settings.
	 */
	init(statusEffectNames: string[]) {
		this.initialize(statusEffectNames);
		//@ts-ignore
		//libWrapper.register(CONSTANTS.MODULE_NAME, 'TokenHUD.prototype._onToggleEffect', this.patchToggleEffect, "MIXED");
	}
	/*
  async patchToggleEffect(wrapped, event, config) {
    event.preventDefault();
    event.stopPropagation();
    const img = event.currentTarget;

    if (img.dataset.effectUuid) {
      const effectId = img.dataset.effectUuid;
      //return TempEffectsAsStatusesTokenHUD.toggleEffectByUuid(img.dataset.effectUuid);
      (<EffectInterface>API.effectInterface).toggleEffectFromIdOnToken(effectId)
    }

    return wrapped(event, config);
  }
  */

	/**
	 * Initialize the token status effects based on the user configured settings.
	 */
	initialize(statusEffectNames: string[]) {
		const modifyStatusEffects = "add"; // TODO for now is always 'add'
		let statusEffects;
		//@ts-ignore
		if (modifyStatusEffects === "replace") {
			statusEffects = this._fetchStatusEffects(statusEffectNames);
			// //@ts-ignore
			// if (CONFIG.specialStatusEffects) {
			// 	//@ts-ignore
			// 	CONFIG.specialStatusEffects = {
			// 		DEFEATED: "Convenient Effect: Dead",
			// 		INVISIBLE: "Convenient Effect: Invisible",
			// 		BLIND: "Convenient Effect: Blinded",
			// 	};
			// }
		} else if (modifyStatusEffects === "add") {
			statusEffects = CONFIG.statusEffects.concat(this._fetchStatusEffects(statusEffectNames));
			// //@ts-ignore
			// if (CONFIG.specialStatusEffects) {
			// 	//@ts-ignore
			// 	CONFIG.specialStatusEffects = {
			// 		DEFEATED: "Convenient Effect: Dead",
			// 		INVISIBLE: "Convenient Effect: Invisible",
			// 		BLIND: "Convenient Effect: Blinded",
			// 	};
			// }
		} else {
			// Do nothing
		}

		if (statusEffects) {
			if (game.settings.get(CONSTANTS.MODULE_ID, "statusEffectsSortOrder") === "alphabetical") {
				statusEffects = statusEffects.sort((a, b) => {
					let nameA = a.name.toLowerCase();
					let nameB = b.name.toLowerCase();

					if (nameA < nameB) {
						return -1;
					}
					if (nameA > nameB) {
						return 1;
					}
					return 0;
				});
			}

			CONFIG.statusEffects = statusEffects;
		}
	}

	_fetchStatusEffects(statusEffectNames: string[]) {
		if (!statusEffectNames) {
			return [];
		}
		return statusEffectNames
			.map((name) => {
				// Integration with DFred
				// TODO check this
				//@ts-ignore
				const effect = game.dfreds._customEffectsHandler
					.getCustomEffects()
					.find((effect) => effect.name === name);

				if (effect) {
					return effect;
				}
				//@ts-ignore
				return game.dfreds.effects.all.find((effect) => effect.name === name);
			})
			.filter((effect) => effect)
			.map((effect) => effect.convertToActiveEffectData());
		// TODO
		// .map((effect) => {
		// 	return {
		// 	  id: `Convenient Effect: ${effect.name}`,
		// 	  ...effect,
		// 	};
		// });
	}

	/**
	 * This function is called when a token status effect is toggled. If the
	 * status effect is one added by the convenient effect module, it is handled
	 * here. Otherwise, the original wrapper function is used.
	 *
	 * @param {Token5e} token - the token to toggle the effect on
	 * @param {fn} wrapped - the original onToggleEffect function
	 * @param {any[]} args - any arguments provided with the original onToggleEffect function
	 */
	async onToggleEffect({ token, wrapper, args }) {
		// const token = args[0]; //<Token>(<unknown>this);
		// const [eventArr] = args;
		// const event = eventArr[0];
		// const overlay = eventArr.length > 1 && eventArr[1]?.overlay;
		const [event] = args;
		const overlay = args.length > 1 && args[1]?.overlay;
		const statusEffectId = event.currentTarget.dataset?.statusId;
		const img = event.currentTarget;

		const effect =
			img.dataset.statusId && token.actor
				? CONFIG.statusEffects.find((e) => e.id === img.dataset.statusId)
				: img.getAttribute("src");

		if (statusEffectId) {
			// Integration with DFred
			// if (statusEffectId.startsWith('Convenient Effect: ')) {
			// event.preventDefault();
			// event.stopPropagation();
			// const effectName = statusEffectId.replace('Convenient Effect: ', '');
			// const overlay = args.length > 1 && args[1]?.overlay;
			// const tokenId = <string>token.actor?.uuid;+
			// if (statusEffectId.startsWith('Convenient Effect: ')) {

			if (!effect) {
				const arrayStatusEffects = Object.values(this._getStatusEffectChoicesInternal(token)) || [];
				const statusEffectInternal: StatusEffectInternal = <StatusEffectInternal>arrayStatusEffects.find(
					(e) => {
						return e.id === img.dataset.statusId;
					}
				);
				// const effect2 =
				// 	img.dataset.statusId && token.actor
				// 		? statusEffectInternal.src
				// 		: img.getAttribute("src");

				if (statusEffectInternal) {
					let activeEffectFound: ActiveEffect | undefined = undefined;
					const tokenId = token.id;
					if (statusEffectId.startsWith("Convenient Effect:")) {
						let statusId = statusEffectId.replace("Convenient Effect:", "");
						statusId = statusId.replace(/\s/g, "");
						statusId = statusId.trim().toLowerCase();
						const effectName = statusId;
						activeEffectFound = <ActiveEffect>await API.findEffectByNameOnToken(tokenId, effectName);
					} else {
						const effectId = statusEffectId;
						activeEffectFound = <ActiveEffect>await API.findEffectByIdOnToken(tokenId, effectId);
					}
					if (!activeEffectFound) {
						for (const effect of <ActiveEffect[]>Object.values(token.actor.effects.contents)) {
							if (
								isStringEquals(
									//@ts-ignore
									effect.flags.core.statusId,
									"Convenient Effect: " + statusEffectInternal.name
								)
							) {
								activeEffectFound = effect;
								break;
							}
							//@ts-ignore
							if (isStringEquals(effect.flags.core.statusId, statusEffectId)) {
								activeEffectFound = effect;
								break;
							}
						}
					}
					if (activeEffectFound) {
						//@ts-ignore
						const effectName = <string>activeEffectFound.name;
						// Added 2022-09-11 for strange bug on draw effect ?
						// is the reverse condition
						/*
						if(token.document.overlayEffect === "[object Object]"){
							//@ts-ignore
							if (String(activeEffectFound.disabled) === "true") {
								token.document.overlayEffect = undefined;
							} else {
								token.document.overlayEffect = img.getAttribute("src");
							}
						} else {
							if(token.document.overlayEffect){
								token.document.overlayEffect = undefined;
							} else {
								token.document.overlayEffect = img.getAttribute("src");
							}
						}
						*/
						const texture = img.getAttribute("src");
						//@ts-ignore
						let isDisabled = String(activeEffectFound.disabled) === "true" ? true : false;
						let active = !isDisabled;
						// active = active ?? token.document.overlayEffect !== texture;
						token.document.overlayEffect = active ? null : img.getAttribute("src");

						// Original code
						event.preventDefault();
						event.stopPropagation();
						// let img = event.currentTarget;
						// const effect = ( img.dataset.statusId && token.actor ) ?
						// 	CONFIG.statusEffects.find(e => e.id === img.dataset.statusId) :
						// 	img.getAttribute("src");
						//@ts-ignore
						if (activeEffectFound.flags.core?.statusId?.startsWith("Convenient Effect:")) {
							//@ts-ignore
							statusEffectInternal.id = "Convenient Effect: " + statusEffectInternal.name;
						} else {
							//@ts-ignore
							statusEffectInternal.id = activeEffectFound._id;
						}
						// return token.toggleEffect(statusEffectInternal, { overlay });

						const effectId = <string>activeEffectFound.id;
						const effect = EffectSupport.convertActiveEffectToEffect(activeEffectFound);
						effect.customId = effectId;
						effect.name = effectName;
						effect.overlay = overlay;
						await API.toggleEffectFromDataOnToken(tokenId, effect, false, undefined, undefined, overlay);

						active = !active;
						token._toggleOverlayEffect(texture, { active });

						// // Assign the overlay effect
						// active = active ?? token.document.overlayEffect !== texture;
						// const effectIn = active ? texture : undefined;
						// await token.document.update({overlayEffect: effectIn});
						// await token.document.update({ overlayEffect: effectIn });
						// await token.document.update({ overlayEffect: effectIn });
						// // Set the defeated status in the combat tracker
						// // TODO - deprecate this and require that active effects be used instead
						// if ( (texture === CONFIG.controlIcons.defeated) && game.combat ) {
						// 	const combatant = game.combat.getCombatantByToken(token.id);
						// 	if ( combatant ) await combatant.update({defeated: active});
						// }
					}
				}
			} else {
				wrapper(...args);
			}
		} else {
			wrapper(...args);
		}
		// // Original code
		// event.preventDefault();
		// event.stopPropagation();
		// // let img = event.currentTarget;
		// // const effect = ( img.dataset.statusId && token.actor ) ?
		// // 	CONFIG.statusEffects.find(e => e.id === img.dataset.statusId) :
		// // 	img.getAttribute("src");
		// return token.toggleEffect(effect, {overlay});
	}

	_getStatusEffectChoicesInternal(token: Token): StatusEffectInternal[] {
		// const token = args[0]; //<Token>(<unknown>this);

		const doc = token.document;

		// Get statuses which are active for the token actor
		const actor = token.actor || null;
		const statuses = actor
			? actor.effects.reduce((obj, e) => {
					//@ts-ignore
					const id = e.flags.core?.statusId;
					if (id) {
						obj[id] = {
							id: id,
							//@ts-ignore
							overlay: !!e.flags.core?.overlay
						};
					}
					return obj;
			  }, {})
			: {};

		let effectsArray: ActiveEffect[] =
			//@ts-ignore
			<ActiveEffect[]>token.actor?.effects?.contents || <ActiveEffect[]>doc.effects || [];
		if (game.settings.get(CONSTANTS.MODULE_NAME, "showOnlyTemporaryStatusEffectNames")) {
			effectsArray = effectsArray.filter((ae) => {
				return ae.isTemporary;
			});
		}

		// Prepare the list of effects from the configured defaults and any additional effects present on the Token
		const tokenEffects = <any>foundry.utils.deepClone(effectsArray) || [];
		//@ts-ignore
		// if (doc.overlayEffect) {
		// 	//@ts-ignore
		// 	tokenEffects.push(doc.overlayEffect);
		// }y

		if ((tokenEffects.size && tokenEffects.size <= 0) || (tokenEffects.length && tokenEffects.length <= 0)) {
			//@ts-ignore
			return CONFIG.statusEffects.reduce((obj, e: { icon: string; id: string; label: string }) => {
				const id = e.id; // NOTE: added this

				const src = <string>e.icon ?? e;
				if (id in obj) {
					return obj; // NOTE: changed from src to id
				}

				const status = statuses[e.id] || {};

				let srcExt = false;
				let isDisabled = false;
				for (const ae of effectsArray) {
					//@ts-ignore
					if (ae.icon.includes(src)) {
						srcExt = true;
						//@ts-ignore
						isDisabled = ae.disabled;
						break;
					}
				}

				// const isActive = !!status.id || effectsArray.includes(src);
				let isActive = !!status.id || srcExt;
				//@ts-ignore
				let isOverlay = !!status.overlay || doc.overlayEffect === src;
				if (isOverlay && isDisabled) {
					isOverlay = false;
				}
				if (!isActive && !isDisabled) {
					isActive = true;
				}

				// NOTE: changed key from src to id
				obj[id] = {
					id: e.id ?? "",
					title: e.label ? game.i18n.localize(e.label) : null,
					label: e.label ? game.i18n.localize(e.label) : null, // TODO to remove ?
					src: src,
					icon: src,
					isActive,
					isOverlay,
					cssClass: [isActive ? "active" : null, isOverlay ? "overlay" : null].filterJoin(" ")
				};
				return obj;
			}, {});
		}

		// const newTokenEffects = <ActiveEffect[]>[];
		// for (const tokenEffect of tokenEffects) {
		//   newTokenEffects.push(tokenEffect);
		// }

		// const activeEffect = <ActiveEffect>newTokenEffects.find((ae) =>{
		//   return isStringEquals(<string>ae.id,e.id) ||  isStringEquals(<string>ae.name,e.name);
		// });

		const statusEffectDefaultFiltered = tokenEffects.filter((effect: any) => {
			let result = true;
			for (const efct of CONFIG.statusEffects) {
				if (isStringEquals(effect.name, <string>efct.label)) {
					result = false;
					break;
				}
			}
			return result;
		});

		return <StatusEffectInternal[]>(
			CONFIG.statusEffects.concat(<any>statusEffectDefaultFiltered).reduce((obj, e: any) => {
				if (e.contents) {
					let activeEffects = <ActiveEffect[]>e.contents;
					if (game.settings.get(CONSTANTS.MODULE_NAME, "showOnlyTemporaryStatusEffectNames")) {
						activeEffects = activeEffects.filter((ae) => {
							return ae.isTemporary;
						});
					}
					for (const activeEffect of activeEffects) {
						if (activeEffect) {
							//@ts-ignore
							let nameEffect = <string>activeEffect.name || "";
							nameEffect = nameEffect.replace("Convenient Effect:", "").trim();
							//@ts-ignore
							const iconEffect = <string>activeEffect.icon || "";
							//@ts-ignore
							const isDisabled = activeEffect.disabled;
							//@ts-ignore
							let isActive = !activeEffect.disabled;
							//@ts-ignore
							let isOverlay = activeEffect.flags?.core?.overlay ?? false;
							if (isOverlay && isDisabled) {
								isOverlay = false;
							}
							if (!isActive && !isDisabled) {
								isActive = true;
							}

							//@ts-ignore
							let statusId = activeEffect.flags?.core?.statusId ?? activeEffect.name;
							statusId = statusId.replace("Convenient Effect:", "");
							statusId = statusId.replace(/\s/g, "");
							statusId = statusId.trim().toLowerCase();

							obj[statusId] = {
								id: statusId ?? "",
								title: nameEffect ? game.i18n.localize(nameEffect) : null,
								label: nameEffect ? game.i18n.localize(nameEffect) : null, // TODO to remove ?
								src: iconEffect,
								icon: iconEffect,
								isActive,
								isOverlay,
								cssClass: [isActive ? "active" : null, isOverlay ? "overlay" : null].filterJoin(" ")
							};
						}
					}
				} else if (e instanceof ActiveEffect) {
					const activeEffect = <ActiveEffect>e;
					//@ts-ignore
					let nameEffect = <string>activeEffect.name || "";
					nameEffect = nameEffect.replace("Convenient Effect:", "").trim();
					//@ts-ignore
					const iconEffect = <string>activeEffect.icon || "";
					//@ts-ignore
					const isDisabled = activeEffect.disabled;
					//@ts-ignore
					let isActive = !activeEffect.disabled;
					//@ts-ignore
					let isOverlay = activeEffect.flags?.core?.overlay ?? false;
					if (isOverlay && isDisabled) {
						isOverlay = false;
					}
					if (!isActive && !isDisabled) {
						isActive = true;
					}

					//@ts-ignore
					let statusId = activeEffect.flags?.core?.statusId ?? activeEffect.label;
					statusId = statusId.replace("Convenient Effect:", "");
					statusId = statusId.replace(/\s/g, "");
					statusId = statusId.trim().toLowerCase();

					obj[statusId] = {
						id: statusId ?? "",
						title: nameEffect ? game.i18n.localize(nameEffect) : null,
						label: nameEffect ? game.i18n.localize(nameEffect) : null, // TODO to remove ?
						src: iconEffect,
						icon: iconEffect,
						isActive,
						isOverlay,
						cssClass: [isActive ? "active" : null, isOverlay ? "overlay" : null].filterJoin(" ")
					};
				} else {
					const id = e.id; // NOTE: added this
					const src = <string>e.icon ?? e;

					if (!e.id) {
						return obj; // NOTE: changed from src to id
					}
					if (id in obj) {
						return obj; // NOTE: changed from src to id
					}

					const status = statuses[e.id] || {};

					let srcExt = false;
					for (const ae of effectsArray) {
						//@ts-ignore
						if (ae.icon.includes(src)) {
							srcExt = true;
							break;
						}
					}

					// const isActive = !!status.id || effectsArray.includes(src);
					const isActive = !!status.id || srcExt;
					//@ts-ignore
					const isOverlay = !!status.overlay || doc.overlayEffect === src;

					// NOTE: changed key from src to id
					obj[id] = {
						id: e.id ?? "",
						title: e.label ? game.i18n.localize(e.label) : null,
						label: e.label ? game.i18n.localize(e.label) : null, // TODO to remove ?
						src: src,
						icon: src,
						isActive,
						isOverlay,
						cssClass: [isActive ? "active" : null, isOverlay ? "overlay" : null].filterJoin(" ")
					};
				}

				return obj;
			}, {})
		);
	}

	/**
	 * This function is called when the status effect view is shown. It does
	 * essentially the same thing that the original method does, except that it
	 * keys the resulting object based on the ID of the status effect, rather than
	 * the icon.
	 *
	 * @param {fn} wrapper - the original getStatusEffectChoices function
	 * @param {any[]} args - any arguments provided with the original getStatusEffectChoices function
	 * @returns {Object} object mapping for all the status effects
	 */
	getStatusEffectChoices(token: Token, wrapped, ...args) {
		return this._getStatusEffectChoicesInternal(token);
	}

	/**
	 * This function is called when the status effects are refreshed. It does
	 * essentially the same thing as the original method does, except that it
	 * bases the status on the token.dataset.statusId rather than the src
	 * attribute
	 *
	 * Refresh the currently active state of all status effect icons in the Token
	 * HUD selector.
	 *
	 * @param {TokenHUD} tokenHud - the token HUD application
	 */
	refreshStatusIcons(tokenHud) {
		const effects = tokenHud.element.find(".status-effects")[0];
		const statuses = tokenHud._getStatusEffectChoices();
		for (const img of effects.children) {
			// NOTE: changed from img.getAttribute('src') to img.dataset.statusId
			const status = statuses[img.dataset.statusId] || {};
			img.classList.toggle("overlay", !!status.isOverlay);
			img.classList.toggle("active", !!status.isActive);
		}
	}
}
