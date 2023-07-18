import CONSTANTS from "./constants";
import EffectInterface from "./effects/effect-interface";
import { error } from "./lib/lib";
import type Effect from "./effects-public/effect";
import type { EffectActions } from "./effects/effect-models";
import StatusEffectsLib from "./effects/status-effects";
import { EffectSupport } from "./effects/effect-support";
import type { EffectChangeData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";
import type { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { Constants } from "./effects-public/effect";
import { createActiveEffect } from "./effects/effect-helpers";

const API = {
	effectInterface: EffectInterface,
	statusEffects: StatusEffectsLib,
	statusSearchTerm: "",

	get _defaultStatusEffectNames() {
		return [
			// add something here ???
		];
	},

	/**
	 * Returns the game setting for the status effect names
	 *
	 * @returns {String[]} the names of all the status effects
	 */
	get statusEffectNames(): string[] {
		return <string[]>game.settings.get(CONSTANTS.MODULE_NAME, "statusEffectNames");
	},

	/**
	 * Adds a given effect name to the saved status effect settings
	 *
	 * @param {string} name - the name of the effect to add to status effects
	 * @returns {Promise} a promise that resolves when the settings update is complete
	 */
	async addStatusEffect(name: string): Promise<void> {
		let statusEffectsArray = this.statusEffectNames;
		statusEffectsArray.push(name);

		statusEffectsArray = [...new Set(statusEffectsArray)]; // remove duplicates

		return game.settings.set(CONSTANTS.MODULE_NAME, "statusEffectNames", statusEffectsArray);
	},

	/**
	 * Removes a given effect name from the saved status effect settings
	 *
	 * @param {string} name - the name of the effect to remove from status effects
	 * @returns {Promise} a promise that resolves when the settings update is complete
	 */
	async removeStatusEffect(name: string): Promise<void> {
		const statusEffectsArray = this.statusEffectNames.filter((statusEffect) => statusEffect !== name);
		return game.settings.set(CONSTANTS.MODULE_NAME, "statusEffectNames", statusEffectsArray);
	},

	/**
	 * Reset status effects back to the original defaults
	 *
	 * @returns {Promise} a promise that resolves when the settings update is complete
	 */
	async resetStatusEffects(): Promise<void> {
		return game.settings.set(CONSTANTS.MODULE_NAME, "statusEffectNames", this._defaultStatusEffectNames);
	},

	/**
	 * Checks if the given effect name is a status effect
	 *
	 * @param {string} name - the effect name to search for
	 * @returns {boolean} true if the effect is a status effect, false otherwise
	 */
	isStatusEffect(name: string): Promise<void> {
		return this.statusEffectNames.includes(name);
	},

	// ======================
	// Effect Management
	// ======================

	async removeEffectArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("removeEffectArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffect(effectName, uuid);
		return result;
	},

	async toggleEffectArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("toggleEffectArr | inAttributes must be of type array");
		}
		const [effectName, overlay, uuids, metadata, effectData] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.toggleEffect(
			effectName,
			overlay,
			uuids,
			metadata,
			effectData
		);
		return result;
	},

	async addEffectArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("addEffectArr | inAttributes must be of type array");
		}
		const [effectName, effectData, uuid, origin, overlay, metadata] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.addEffect(
			effectName,
			effectData,
			uuid,
			origin,
			overlay,
			metadata
		);
		return result;
	},

	async hasEffectAppliedArr(...inAttributes: any[]): Promise<boolean> {
		if (!Array.isArray(inAttributes)) {
			throw error("hasEffectAppliedArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		const result = (<EffectInterface>this.effectInterface)._effectHandler.hasEffectApplied(effectName, uuid);
		return result;
	},

	async hasEffectAppliedOnActorArr(...inAttributes: any[]): Promise<boolean> {
		if (!Array.isArray(inAttributes)) {
			throw error("hasEffectAppliedOnActorArr | inAttributes must be of type array");
		}
		const [effectName, uuid, includeDisabled] = inAttributes;
		const result = (<EffectInterface>this.effectInterface)._effectHandler.hasEffectAppliedOnActor(
			effectName,
			uuid,
			includeDisabled
		);
		return result;
	},

	async hasEffectAppliedFromIdOnActorArr(...inAttributes: any[]): Promise<boolean> {
		if (!Array.isArray(inAttributes)) {
			throw error("hasEffectAppliedFromIdOnActorArr | inAttributes must be of type array");
		}
		const [effectId, uuid, includeDisabled] = inAttributes;
		const result = (<EffectInterface>this.effectInterface)._effectHandler.hasEffectAppliedFromIdOnActor(
			effectId,
			uuid,
			includeDisabled
		);
		return result;
	},

	async addEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("addEffectOnActorArr | inAttributes must be of type array");
		}
		const [effectName, uuid, origin, overlay, effect] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.addEffectOnActor(
			effectName,
			uuid,
			origin,
			overlay,
			effect
		);
		return result;
	},

	async removeEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("removeEffectOnActorArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectOnActor(
			effectName,
			uuid
		);
		return result;
	},

	async removeEffectFromIdOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("removeEffectFromIdOnActor | inAttributes must be of type array");
		}
		const [effectId, uuid] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectFromIdOnActor(
			effectId,
			uuid
		);
		return result;
	},

	async toggleEffectFromIdOnActorArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("addEffectOnActorArr | inAttributes must be of type array");
		}
		const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.toggleEffectFromIdOnActor(
			effectId,
			uuid,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			overlay
		);
		return result;
	},

	async findEffectByNameOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("findEffectByNameOnActorArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.findEffectByNameOnActor(
			effectName,
			uuid
		);
		return result;
	},

	async findEffectByIdOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("findEffectByIdOnActorArr | inAttributes must be of type array");
		}
		const [effectId, uuid] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.findEffectByIdOnActor(
			effectId,
			uuid
		);
		return result;
	},

	async hasEffectAppliedOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("hasEffectAppliedOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid, includeDisabled] = inAttributes;
		const result = (<EffectInterface>this.effectInterface)._effectHandler.hasEffectAppliedOnToken(
			effectName,
			uuid,
			includeDisabled
		);
		return result;
	},

	async hasEffectAppliedFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("hasEffectAppliedFromIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectId, uuid, includeDisabled] = inAttributes;
		const result = (<EffectInterface>this.effectInterface)._effectHandler.hasEffectAppliedFromIdOnToken(
			effectId,
			uuid,
			includeDisabled
		);
		return result;
	},

	async addEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("addEffectOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid, origin, overlay, effect] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.addEffectOnToken(
			effectName,
			uuid,
			origin,
			overlay,
			effect
		);
		return result;
	},

	async removeEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("removeEffectOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectOnToken(
			effectName,
			uuid
		);
		return result;
	},

	async removeEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("removeEffectFromIdOnToken | inAttributes must be of type array");
		}
		const [effectId, uuid] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectFromIdOnToken(
			effectId,
			uuid
		);
		return result;
	},

	async removeEffectFromIdOnTokenMultipleArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("removeEffectFromIdOnTokenMultipleArr | inAttributes must be of type array");
		}
		const [effectIds, uuid] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectFromIdOnTokenMultiple(
			effectIds,
			uuid
		);
		return result;
	},

	async toggleEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("toggleEffectFromIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.toggleEffectFromIdOnToken(
			effectId,
			uuid,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			overlay
		);
		return result;
	},

	async toggleEffectFromDataOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("toggleEffectFromDataOnTokenArr | inAttributes must be of type array");
		}
		const [effect, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.toggleEffectFromDataOnToken(
			effect,
			uuid,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			overlay
		);
		return result;
	},

	async findEffectByNameOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("findEffectByNameOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.findEffectByNameOnToken(
			effectName,
			uuid
		);
		return result;
	},

	async findEffectByIdOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("findEffectByIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectId, uuid] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.findEffectByIdOnToken(
			effectId,
			uuid
		);
		return result;
	},

	async addActiveEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("addActiveEffectOnTokenArr | inAttributes must be of type array");
		}
		const [tokenId, activeEffectData, overlay] = inAttributes;
		const result = (<EffectInterface>this.effectInterface)._effectHandler.addActiveEffectOnToken(
			<string>tokenId,
			activeEffectData,
			overlay
		);
		return result;
	},

	async addActiveEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("addActiveEffectOnTokenArr | inAttributes must be of type array");
		}
		const [actorId, activeEffectData, overlay] = inAttributes;
		const result = (<EffectInterface>this.effectInterface)._effectHandler.addActiveEffectOnActor(
			<string>actorId,
			activeEffectData,
			overlay
		);
		return result;
	},

	async updateEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("updateEffectFromIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectId, uuid, origin, overlay, effectUpdated] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateEffectFromIdOnToken(
			effectId,
			uuid,
			origin,
			overlay,
			effectUpdated
		);
		return result;
	},

	async updateEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("updateEffectFromNameOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid, origin, overlay, effectUpdated] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateEffectFromNameOnToken(
			effectName,
			uuid,
			origin,
			overlay,
			effectUpdated
		);
		return result;
	},

	async updateActiveEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("updateActiveEffectFromIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectId, uuid, origin, overlay, effectUpdated] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateActiveEffectFromIdOnToken(
			effectId,
			uuid,
			origin,
			overlay,
			effectUpdated
		);
		return result;
	},

	async updateActiveEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw error("updateActiveEffectFromNameOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid, origin, overlay, effectUpdated] = inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateActiveEffectFromNameOnToken(
			effectName,
			uuid,
			origin,
			overlay,
			effectUpdated
		);
		return result;
	},

	async onManageActiveEffectFromEffectIdArr(
		...inAttributes: any[]
	): Promise<Item | ActiveEffect | boolean | undefined> {
		const [effectActions, owner, effectId, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled] =
			inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.onManageActiveEffectFromEffectId(
			effectActions,
			owner,
			effectId,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		return result;
	},

	async onManageActiveEffectFromEffectArr(
		...inAttributes: any[]
	): Promise<Item | ActiveEffect | boolean | undefined> {
		const [effectActions, owner, effect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled] =
			inAttributes;
		const result = await (<EffectInterface>this.effectInterface)._effectHandler.onManageActiveEffectFromEffect(
			effectActions,
			owner,
			effect,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		return result;
	},

	async onManageActiveEffectFromActiveEffectArr(
		...inAttributes: any[]
	): Promise<Item | ActiveEffect | boolean | undefined> {
		const [effectActions, owner, activeEffect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled] =
			inAttributes;
		const result = await (<EffectInterface>(
			this.effectInterface
		))._effectHandler.onManageActiveEffectFromActiveEffect(
			effectActions,
			owner,
			activeEffect,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		return result;
	},

	// ======================
	// Effect Actor Management
	// ======================

	async addEffectOnActor(
		actorId: string,
		effectName: string,
		effect: Effect
	): Promise<Item | ActiveEffect | boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).addEffectOnActor(
			effectName,
			<string>actorId,
			effect
		);
		return result;
	},

	async findEffectByNameOnActor(actorId: string, effectName: string): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).findEffectByNameOnActor(
			effectName,
			<string>actorId
		);
		return result;
	},

	async findEffectByIdOnActor(actorId: string, effectId: string): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).findEffectByIdOnActor(effectId, <string>actorId);
		return result;
	},

	async hasEffectAppliedOnActor(
		actorId: string,
		effectName: string,
		includeDisabled: boolean
	): Promise<boolean | undefined> {
		const result = (<EffectInterface>this.effectInterface).hasEffectAppliedOnActor(
			effectName,
			<string>actorId,
			includeDisabled
		);
		return result;
	},

	async hasEffectAppliedFromIdOnActor(
		actorId: string,
		effectId: string,
		includeDisabled: boolean
	): Promise<boolean | undefined> {
		const result = (<EffectInterface>this.effectInterface).hasEffectAppliedFromIdOnActor(
			effectId,
			<string>actorId,
			includeDisabled
		);
		return result;
	},

	async toggleEffectFromIdOnActor(
		actorId: string,
		effectId: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		overlay?: boolean | undefined
	): Promise<boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).toggleEffectFromIdOnActor(
			effectId,
			<string>actorId,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			overlay
		);
		return result;
	},

	async addActiveEffectOnActor(
		actorId: string,
		activeEffectData: ActiveEffect,
		overlay?: boolean
	): Promise<ActiveEffect | undefined> {
		const result = (<EffectInterface>this.effectInterface).addActiveEffectOnActor(
			<string>actorId,
			activeEffectData,
			overlay
		);
		return result;
	},

	async removeEffectOnActor(actorId: string, effectName: string): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).removeEffectOnActor(effectName, <string>actorId);
		return result;
	},

	async removeEffectFromIdOnActor(actorId: string, effectId: string): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).removeEffectFromIdOnActor(
			effectId,
			<string>actorId
		);
		return result;
	},

	// ======================
	// Effect Token Management
	// ======================

	async addEffectOnToken(tokenId: string, effectName: string, effect: Effect): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).addEffectOnToken(
			effectName,
			<string>tokenId,
			effect
		);
		return result;
	},

	async findEffectByNameOnToken(tokenId: string, effectName: string): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).findEffectByNameOnToken(
			effectName,
			<string>tokenId
		);
		return result;
	},

	async findEffectByIdOnToken(tokenId: string, effectId: string): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).findEffectByIdOnToken(effectId, <string>tokenId);
		return result;
	},

	async hasEffectAppliedOnToken(
		tokenId: string,
		effectName: string,
		includeDisabled: boolean
	): Promise<boolean | undefined> {
		const result = (<EffectInterface>this.effectInterface).hasEffectAppliedOnToken(
			effectName,
			<string>tokenId,
			includeDisabled
		);
		return result;
	},

	async hasEffectAppliedFromIdOnToken(
		tokenId: string,
		effectId: string,
		includeDisabled: boolean
	): Promise<boolean | undefined> {
		const result = (<EffectInterface>this.effectInterface).hasEffectAppliedFromIdOnToken(
			effectId,
			<string>tokenId,
			includeDisabled
		);
		return result;
	},

	async toggleEffectFromIdOnToken(
		tokenId: string,
		effectId: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		overlay?: boolean | undefined
	): Promise<boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).toggleEffectFromIdOnToken(
			effectId,
			<string>tokenId,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			overlay
		);
		return result;
	},

	async toggleEffectFromDataOnToken(
		tokenId: string,
		effect: Effect,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		overlay?: boolean | undefined
	): Promise<boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).toggleEffectFromDataOnToken(
			effect,
			<string>tokenId,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			overlay
		);
		return result;
	},

	async addActiveEffectOnToken(
		tokenId: string,
		activeEffectData: ActiveEffect,
		overlay?: boolean
	): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).addActiveEffectOnToken(
			<string>tokenId,
			activeEffectData,
			overlay
		);
		return result;
	},

	async removeEffectOnToken(tokenId: string, effectName: string): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).removeEffectOnToken(effectName, <string>tokenId);
		return result;
	},

	async removeEffectFromIdOnToken(tokenId: string, effectId: string): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).removeEffectFromIdOnToken(
			effectId,
			<string>tokenId
		);
		return result;
	},

	async removeEffectFromIdOnTokenMultiple(tokenId: string, effectIds: string[]): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).removeEffectFromIdOnTokenMultiple(
			effectIds,
			<string>tokenId
		);
		return result;
	},

	async updateEffectFromIdOnToken(
		tokenId: string,
		effectId: string,
		origin: string,
		overlay: boolean,
		effectUpdated: Effect
	): Promise<boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).updateEffectFromIdOnToken(
			effectId,
			tokenId,
			origin,
			overlay,
			effectUpdated
		);
		return result;
	},

	async updateEffectFromNameOnToken(
		tokenId: string,
		effectName: string,
		origin: string,
		overlay: boolean,
		effectUpdated: Effect
	): Promise<boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).updateEffectFromNameOnToken(
			effectName,
			tokenId,
			origin,
			overlay,
			effectUpdated
		);
		return result;
	},

	async updateActiveEffectFromIdOnToken(
		tokenId: string,
		effectId: string,
		origin: string,
		overlay: boolean,
		effectUpdated: ActiveEffect
	): Promise<boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).updateActiveEffectFromIdOnToken(
			effectId,
			tokenId,
			origin,
			overlay,
			effectUpdated
		);
		return result;
	},

	async updateActiveEffectFromNameOnToken(
		tokenId: string,
		effectName: string,
		origin: string,
		overlay: boolean,
		effectUpdated: ActiveEffect
	): Promise<boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).updateActiveEffectFromNameOnToken(
			effectName,
			tokenId,
			origin,
			overlay,
			effectUpdated
		);
		return result;
	},

	// ======================
	// Effect Generic Management
	// ======================

	async onManageActiveEffectFromEffectId(
		effectActions: EffectActions | string,
		owner: Actor | Item,
		effectId: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		isTemporary?: boolean | undefined,
		isDisabled?: boolean | undefined
	): Promise<Item | ActiveEffect | boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).onManageActiveEffectFromEffectId(
			effectActions,
			owner,
			effectId,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		return result;
	},

	async onManageActiveEffectFromEffect(
		effectActions: EffectActions | string,
		owner: Actor | Item,
		effect: Effect,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		isTemporary?: boolean | undefined,
		isDisabled?: boolean | undefined
	): Promise<Item | ActiveEffect | boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).onManageActiveEffectFromEffect(
			effectActions,
			owner,
			effect,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		return result;
	},

	async onManageActiveEffectFromActiveEffect(
		effectActions: EffectActions | string,
		owner: Actor | Item,
		activeEffect: ActiveEffect | null | undefined,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		isTemporary?: boolean | undefined,
		isDisabled?: boolean | undefined
	): Promise<Item | ActiveEffect | boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).onManageActiveEffectFromActiveEffect(
			effectActions,
			owner,
			activeEffect,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		return result;
	},

	// ==========================
	// SUPPORT 2022-09-11
	// ==========================

	async buildDefault(
		id: string,
		name: string,
		icon: string,
		isPassive: boolean,
		changes: EffectChangeData[] = [],
		atlChanges: EffectChangeData[] = [],
		tokenMagicChanges: EffectChangeData[] = [],
		atcvChanges: EffectChangeData[] = []
	): Promise<Effect> {
		return EffectSupport.buildDefault(
			id,
			name,
			icon,
			isPassive,
			changes,
			atlChanges,
			tokenMagicChanges,
			atcvChanges
		);
	},

	async isDuplicateEffectChange(aeKey: string, arrChanges: EffectChangeData[]): Promise<boolean> {
		return EffectSupport.isDuplicateEffectChange(aeKey, arrChanges);
	},

	async _handleIntegrations(effect: Effect): Promise<EffectChangeData[]> {
		return EffectSupport._handleIntegrations(effect);
	},

	async convertActiveEffectToEffect(activeEffect: ActiveEffect): Promise<Effect> {
		return EffectSupport.convertActiveEffectToEffect(activeEffect);
	},

	async convertActiveEffectDataPropertiesToActiveEffect(
		activeEffectDataProperties: PropertiesToSource<any>,
		isPassive: boolean
	): Promise<ActiveEffect> {
		return EffectSupport.convertActiveEffectDataPropertiesToActiveEffect(activeEffectDataProperties, isPassive);
	},

	async convertToActiveEffectData(effect: Effect): Promise<Record<string, unknown>> {
		return EffectSupport.convertToActiveEffectData(effect);
	},

	async retrieveChangesOrderedByPriorityFromAE(activeEffect: ActiveEffect): Promise<EffectChangeData[]> {
		return EffectSupport.retrieveChangesOrderedByPriorityFromAE(activeEffect);
	},

	async prepareOriginForToken(tokenOrTokenId: Token | string): Promise<string> {
		return EffectSupport.prepareOriginForToken(tokenOrTokenId);
	},

	async prepareOriginForActor(actorOrActorId: Actor | string): Promise<string> {
		return EffectSupport.prepareOriginForActor(actorOrActorId);
	},

	async prepareOriginFromEntity(entity: string | ActiveEffect | Actor | Item | Token): Promise<string> {
		return EffectSupport.prepareOriginFromEntity(entity);
	},

	async convertToATLEffect(
		//lockRotation: boolean,
		sightEnabled: boolean,
		dimSight: number,
		brightSight: number,
		sightAngle: number,
		sightVisionMode: string, //e.g. 'darkvision'

		dimLight: number,
		brightLight: number,
		lightColor: string,
		lightAlpha: number,
		lightAngle: number,

		lightColoration: number | null = null,
		lightLuminosity: number | null = null,
		lightGradual: boolean | null = null,
		lightSaturation: number | null = null,
		lightContrast: number | null = null,
		lightShadows: number | null = null,

		lightAnimationType: string | null,
		lightAnimationSpeed: number | null,
		lightAnimationIntensity: number | null,
		lightAnimationReverse: boolean | null,

		// applyAsAtlEffect = false, // rimosso
		effectName: string | null = null,
		effectIcon: string | null = null,
		duration: number | null = null,
		// tint: string | null = null,
		// vision = false,
		// id: string | null = null,
		// name: string | null = null,
		height: number | null = null,
		width: number | null = null,
		scale: number | null = null,
		alpha: number | null = null
	): Promise<Effect> {
		return EffectSupport.convertToATLEffect(
			//lockRotation,
			sightEnabled,
			dimSight,
			brightSight,
			sightAngle,
			sightVisionMode,

			dimLight,
			brightLight,
			lightColor,
			lightAlpha,
			lightAngle,

			lightColoration,
			lightLuminosity,
			lightGradual,
			lightSaturation,
			lightContrast,
			lightShadows,

			lightAnimationType,
			lightAnimationSpeed,
			lightAnimationIntensity,
			lightAnimationReverse,

			// applyAsAtlEffect, // rimosso
			effectName,
			effectIcon,
			duration,
			// tint,
			// visio,
			// id,
			// name,
			height,
			width,
			scale,
			alpha
		);
	},

	// 2023-02-25

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {ActiveEffect} the found effect
	 */
	async findEffectByName(effectName): Promise<ActiveEffect | undefined> {
		const result = await (<EffectInterface>this.effectInterface).findEffectByName(effectName);
		return result;
	},

	/**
	 * Toggles the effect on the provided actor UUIDS as the GM via sockets
	 *
	 * @param {string} effectName - name of the effect to toggle
	 * @param {string} overlay - name of the effect to toggle
	 * @param {string[]} uuids - UUIDS of the actors to toggle the effect on
	 * @param {string[]} withSocket - use socket library for execute as GM
	 * @returns {Promise} a promise that resolves when the GM socket function completes
	 */
	async toggleEffect(
		effectName: string,
		overlay = false,
		uuids = <string[]>[],
		withSocket = true
	): Promise<boolean | undefined> {
		const result = await (<EffectInterface>this.effectInterface).toggleEffect(effectName, overlay, uuids);
		return result;
	},

	/**
	 * Creates new custom effects with the provided active effect data.
	 *
	 * @param {object} params - the params for adding an effect
	 * @param {ActiveEffect[]} params.activeEffects - array of active effects to add
	 * @returns {Promise} a promise that resolves when the active effects have finished being added
	 */
	async createNewCustomEffectsWith({ activeEffects }): Promise<ActiveEffect[] | undefined> {
		const result = await (<EffectInterface>this.effectInterface).createNewCustomEffectsWith({
			activeEffects
		});
		return result;
	},

	/**
	 * Checks if the given effect has nested effects
	 *
	 * @param {ActiveEffect} effect - the active effect to check the nested effets on
	 * @returns
	 */
	async hasNestedEffects(effect, withSocket = true): Promise<boolean | undefined> {
		const nestedEffects =
			getProperty(effect, `flags.${Constants.MODULE_ID}.${Constants.FLAGS.NESTED_EFFECTS}`) ?? [];
		return nestedEffects.length > 0;
	},

	async _getNestedEffectSelection(effect, withSocket = true): Promise<ActiveEffect | undefined> {
		const uuids = this._foundryHelpers.getActorUuids();
		const nestedEffectNames =
			getProperty(effect, `flags.${Constants.MODULE_ID}.${Constants.FLAGS.NESTED_EFFECTS}`) ?? [];

		const nestedEffects = nestedEffectNames
			.map((nestedEffect) => this.findEffectByNameOnToken(nestedEffect, <string>uuids[0], withSocket))
			.filter((effect) => effect !== undefined);

		const content = await renderTemplate("modules/dfreds-convenient-effects/templates/nested-effects-dialog.hbs", {
			parentEffect: effect,
			nestedEffects
		});
		const choice = await Dialog.prompt(
			{
				title: effect.name,
				content: content,
				label: "Select Effect",
				callback: (html) => {
					const htmlChoice = html.find('select[name="effect-choice"]').val();
					return htmlChoice;
				},
				rejectClose: false
			},
			//@ts-ignore
			{ width: 300 }
		);

		return nestedEffects.find((nestedEffect) => nestedEffect.name == choice);
	}
};

export default API;
