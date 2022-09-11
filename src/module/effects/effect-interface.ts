import FoundryHelpers from "./foundry-helpers";
import { registerSocket } from "../socket";
import type Effect from "./effect";
import EffectHandler from "./effect-handler";
import { errorM, isGMConnectedAndSocketLibEnable } from "./effect-log";
import type {
	ActiveEffectData,
	ActorData,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import type EmbeddedCollection from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs";
import type { EffectActions } from "./effect-models";

/**
 * Interface for working with effects and executing them as a GM via sockets
 */
export default class EffectInterface {
	//   _actorUpdater: ActorUpdater;
	_effectHandler: EffectHandler;
	_foundryHelpers: FoundryHelpers;

	_socket: any;
	moduleName: string;

	constructor(moduleName: string) {
		this.moduleName = moduleName;
		this._effectHandler = new EffectHandler(moduleName);
		this._foundryHelpers = new FoundryHelpers();
		this._socket = registerSocket();
	}

	/**
	 * Initializes the socket and registers the socket functions
	 */
	initialize(moduleName = ""): void {
		//this._socket = registerSocket();
		if (moduleName) {
			this.moduleName = moduleName;
			this._effectHandler = new EffectHandler(moduleName);
		}
	}

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
		if (uuids.length === 0) {
			uuids = this._foundryHelpers.getActorUuidsFromCanvas();
		}

		if (uuids.length === 0) {
			errorM(this.moduleName, `Please select or target a token to toggle ${effectName}`, true);
			return undefined;
		}

		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("toggleEffect", effectName, overlay, uuids);
		} else {
			return this._effectHandler.toggleEffect(effectName, overlay, uuids);
		}
	}

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 * @deprecated remove from dfreds
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is applied to
	 * @param {string[]} withSocket - use socket library for execute as GM
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectApplied(effectName: string, uuid: string, withSocket = true): boolean {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("hasEffectApplied", effectName, uuid);
		} else {
			return this._effectHandler.hasEffectApplied(effectName, uuid);
		}
	}

	/**
	 * Removes the effect from the provided actor UUID as the GM via sockets
	 *
	 * @param {object} params - the effect params
	 * @param {string} params.effectName - the name of the effect to remove
	 * @param {string} params.uuid - the UUID of the actor to remove the effect from
	 * @returns {Promise} a promise that resolves when the GM socket function completes
	 */
	async removeEffect(effectName: string, uuid: string, withSocket = true): Promise<ActiveEffect | undefined> {
		const actor = this._foundryHelpers.getActorByUuid(uuid);

		if (!actor) {
			errorM(this.moduleName, `Actor ${uuid} could not be found`, true);
			return undefined;
		}

		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("removeEffect", {
				effectName,
				uuid,
			});
		} else {
			return this._effectHandler.removeEffect(effectName, uuid);
		}
	}

	/**
	 * Adds the effect to the provided actor UUID as the GM via sockets
	 *
	 * @param {string} effectName - the name of the effect to add
	 * @param {string} effectData - the active effect data to add // mod 4535992
	 * @param {string} uuid - the UUID of the actor to add the effect to
	 * @param {string} origin - the origin of the effect
	 * @param {string} overlay - if the effect is an overlay or not
	 * @param {string} metadata - the metadata of the effect
	 * @returns {Promise} a promise that resolves when the GM socket function completes
	 */
	async addEffect(
		effectName: string,
		effectData: Effect,
		uuid: string,
		origin: string,
		overlay: boolean,
		metadata = undefined,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		const actor = this._foundryHelpers.getActorByUuid(uuid);

		if (!actor) {
			errorM(this.moduleName, `Actor ${uuid} could not be found`);
			return undefined;
		}

		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("addEffect", effectName, effectData, uuid, origin, overlay, metadata);
		} else {
			return this._effectHandler.addEffect(effectName, effectData, uuid, origin, overlay, metadata);
		}
	}

	/**
	 * Adds the defined effect to the provided actor UUID as the GM via sockets
	 *
	 * @param {object} effectData - the object containing all of the relevant effect data
	 * @param {string} uuid - the UUID of the actor to add the effect to
	 * @param {string} origin - the origin of the effect
	 * @param {boolean} overlay - if the effect is an overlay or not
	 * @returns {Promise} a promise that resolves when the GM socket function completes
	 */
	async addEffectWith(
		effectData: Effect,
		uuid: string,
		origin: string,
		overlay: boolean,
		metadata = undefined,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		// const effect = new Effect(effectData);

		const actor = this._foundryHelpers.getActorByUuid(uuid);

		if (!actor) {
			errorM(this.moduleName, `Actor ${uuid} could not be found`, true);
			return undefined;
		}

		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			const effectName = null; // TODO 2022-07-09
			return this._socket.executeAsGM("addEffect", effectName, effectData, uuid, origin, overlay, metadata);
		} else {
			const effectName = undefined; // TODO 2022-07-09;
			return this._effectHandler.addEffect(effectName, effectData, uuid, origin, overlay, metadata);
		}
	}

	// ============================================================
	// Additional feature for retrocompatibility
	// ============================================================

	// ====================================================================
	// ACTOR MANAGEMENT
	// ====================================================================

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedOnActor(effectName: string, uuid: string, includeDisabled: boolean, withSocket = true): boolean {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("hasEffectAppliedOnActor", effectName, uuid, includeDisabled);
		} else {
			return this._effectHandler.hasEffectAppliedOnActor(effectName, uuid, includeDisabled);
		}
	}

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectId - the id of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedFromIdOnActor(
		effectId: string,
		uuid: string,
		includeDisabled: boolean,
		withSocket = true
	): boolean {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("hasEffectAppliedFromIdOnActor", effectId, uuid, includeDisabled);
		} else {
			return this._effectHandler.hasEffectAppliedFromIdOnActor(effectId, uuid, includeDisabled);
		}
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectOnActor(effectName: string, uuid: string, withSocket = true): Promise<ActiveEffect | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("removeEffectOnActor", effectName, uuid);
		} else {
			return this._effectHandler.removeEffectOnActor(effectName, uuid);
		}
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectFromIdOnActor(
		effectId: string,
		uuid: string,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("removeEffectFromIdOnActor", effectId, uuid);
		} else {
			return this._effectHandler.removeEffectFromIdOnActor(effectId, uuid);
		}
	}

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {string} effectName - the name of the effect to add
	 * @param {string} uuid - the uuid of the actor to add the effect to
	 */
	async addEffectOnActor(
		effectName: string,
		uuid: string,
		effect: Effect,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		if (!uuid) {
			errorM(this.moduleName, `Actor ${uuid} could not be found`, true);
			return undefined;
		}

		if (!effect) {
			errorM(this.moduleName, `Effect ${effectName} could not be found`, true);
			return undefined;
		}

		// if (effect.nestedEffects.length > 0) {
		//   effect = await this.getNestedEffectSelection(effect);
		// }
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("addEffectOnActor", effect.name, uuid, undefined, false, effect);
		} else {
			return this._effectHandler.addEffectOnActor(effect.name, uuid, "", false, effect);
		}
	}

	async toggleEffectFromIdOnActor(
		effectId: string,
		uuid: string,
		alwaysDelete: boolean,
		forceEnabled?: boolean,
		forceDisabled?: boolean,
		overlay?: boolean,
		withSocket = true
	): Promise<boolean | undefined> {
		if (effectId.length === 0) {
			errorM(this.moduleName, `Please select or target a active effect to toggle ${effectId}`, true);
			return undefined;
		}

		const actor = <Actor>game.actors?.get(uuid);
		const effect = <ActiveEffect>actor.effects.find((entity: ActiveEffect) => {
			return <string>entity.id === effectId;
		});

		if (!effect) {
			errorM(this.moduleName, `Effect ${effectId} was not found`, true);
			return undefined;
		}

		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM(
				"toggleEffectFromIdOnActor",
				effectId,
				uuid,
				alwaysDelete,
				forceEnabled,
				forceDisabled,
				overlay
			);
		} else {
			return this._effectHandler.toggleEffectFromIdOnActor(
				effectId,
				uuid,
				alwaysDelete,
				forceEnabled,
				forceDisabled,
				overlay
			);
		}
	}

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {string} uuid - the uuid of the actor to add the effect to
	 * @param {string} activeEffectData - the name of the effect to add
	 */
	async addActiveEffectOnActor(
		uuid: string,
		activeEffectData: ActiveEffectData,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("addActiveEffectOnActor", uuid, activeEffectData);
		} else {
			return this._effectHandler.addActiveEffectOnActor(uuid, activeEffectData);
		}
	}

	/**
	 * Toggles the effect on the provided actor UUIDS as the GM via sockets
	 *
	 * @param {string} effectName - name of the effect to toggle
	 * @param {string} uuid - UUID of the actor to toggle the effect on
	 * @returns {Promise} a promise that resolves when the GM socket function completes
	 */
	async findEffectByNameOnActor(
		effectName: string,
		uuid: string,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("findEffectByNameOnActor", effectName, uuid);
		} else {
			return this._effectHandler.findEffectByNameOnActor(effectName, uuid);
		}
	}

	// ====================================================================
	// TOKEN MANAGEMENT
	// ====================================================================

	/**
	 * Checks to see if any of the current active effects applied to the token
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the token to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedOnToken(effectName: string, uuid: string, includeDisabled: boolean, withSocket = true): boolean {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("hasEffectAppliedOnToken", effectName, uuid, includeDisabled);
		} else {
			return this._effectHandler.hasEffectAppliedOnToken(effectName, uuid, includeDisabled);
		}
	}

	/**
	 * Checks to see if any of the current active effects applied to the token
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectId - the id of the effect to check
	 * @param {string} uuid - the uuid of the token to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedFromIdOnToken(
		effectId: string,
		uuid: string,
		includeDisabled: boolean,
		withSocket = true
	): boolean {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("hasEffectAppliedFromIdOnToken", effectId, uuid, includeDisabled);
		} else {
			return this._effectHandler.hasEffectAppliedFromIdOnToken(effectId, uuid, includeDisabled);
		}
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectOnToken(effectName: string, uuid: string, withSocket = true): Promise<ActiveEffect | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("removeEffectOnToken", effectName, uuid);
		} else {
			return this._effectHandler.removeEffectOnToken(effectName, uuid);
		}
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("removeEffectFromIdOnToken", effectId, uuid);
		} else {
			return this._effectHandler.removeEffectFromIdOnToken(effectId, uuid);
		}
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectIds - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectFromIdOnTokenMultiple(
		effectIds: string[],
		uuid: string,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("removeEffectFromIdOnTokenMultiple", effectIds, uuid);
		} else {
			return this._effectHandler.removeEffectFromIdOnTokenMultiple(effectIds, uuid);
		}
	}

	/**
	 * Adds the effect with the provided name to an token matching the provided
	 * UUID
	 *
	 * @param {string} effectName - the name of the effect to add
	 * @param {string} uuid - the uuid of the token to add the effect to
	 */
	async addEffectOnToken(
		effectName: string,
		uuid: string,
		effect: Effect,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		if (!uuid) {
			errorM(this.moduleName, `Token ${uuid} could not be found`, true);
			return undefined;
		}

		if (!effect) {
			errorM(this.moduleName, `Effect ${effectName} could not be found`, true);
			return undefined;
		}

		// if (effect.nestedEffects.length > 0) {
		//   effect = await this.getNestedEffectSelection(effect);
		// }
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("addEffectOnToken", effect.name, uuid, undefined, false, effect);
		} else {
			return this._effectHandler.addEffectOnToken(effect.name, uuid, "", false, effect);
		}
	}

	async toggleEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		alwaysDelete: boolean,
		forceEnabled?: boolean,
		forceDisabled?: boolean,
		overlay?: boolean,
		withSocket = true
	): Promise<boolean | undefined> {
		if (effectId.length === 0) {
			errorM(this.moduleName, `Please select or target a active effect to toggle ${effectId}`, true);
			return undefined;
		}

		const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>token.actor?.effects?.contents || [];
		const effect = <ActiveEffect>actorEffects.find(
			//(activeEffect) => <boolean>activeEffect?.flags?.isConvenient && <string>activeEffect.id == effectId,
			//@ts-ignore
			(activeEffect) => <string>activeEffect?._id === effectId
		);

		// if (!effect) return undefined;

		if (!effect) {
			errorM(this.moduleName, `Effect ${effectId} was not found`, true);
			return undefined;
		}

		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM(
				"toggleEffectFromIdOnToken",
				effectId,
				uuid,
				alwaysDelete,
				forceEnabled,
				forceDisabled,
				overlay
			);
		} else {
			return this._effectHandler.toggleEffectFromIdOnToken(
				effectId,
				uuid,
				alwaysDelete,
				forceEnabled,
				forceDisabled,
				overlay
			);
		}
	}

	async toggleEffectFromDataOnToken(
		effect: Effect,
		uuid: string,
		alwaysDelete: boolean,
		forceEnabled?: boolean,
		forceDisabled?: boolean,
		overlay?: boolean,
		withSocket = true
	): Promise<boolean | undefined> {
		if (!effect) {
			errorM(this.moduleName, `Effect ${effect} was not found`, true);
			return undefined;
		}

		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM(
				"toggleEffectFromDataOnToken",
				effect,
				uuid,
				alwaysDelete,
				forceEnabled,
				forceDisabled,
				overlay
			);
		} else {
			return this._effectHandler.toggleEffectFromDataOnToken(
				effect,
				uuid,
				alwaysDelete,
				forceEnabled,
				forceDisabled,
				overlay
			);
		}
	}

	/**
	 * Adds the effect with the provided name to an token matching the provided
	 * UUID
	 *
	 * @param {string} uuid - the uuid of the token to add the effect to
	 * @param {string} activeEffectData - the name of the effect to add
	 */
	async addActiveEffectOnToken(
		uuid: string,
		activeEffectData: ActiveEffectData,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("addActiveEffectOnToken", uuid, activeEffectData);
		} else {
			return this._effectHandler.addActiveEffectOnToken(uuid, activeEffectData);
		}
	}

	/**
	 * Toggles the effect on the provided token UUIDS as the GM via sockets
	 *
	 * @param {string} effectName - name of the effect to toggle
	 * @param {string} uuid - UUID of the token to toggle the effect on
	 * @returns {Promise} a promise that resolves when the GM socket function completes
	 */
	async findEffectByNameOnToken(
		effectName: string,
		uuid: string,
		withSocket = true
	): Promise<ActiveEffect | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM("findEffectByNameOnToken", effectName, uuid);
		} else {
			return this._effectHandler.findEffectByNameOnToken(effectName, uuid);
		}
	}

	async updateEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: Effect,
		withSocket = true
	): Promise<boolean | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM(
				"updateEffectFromIdOnToken",
				effectId,
				uuid,
				origin,
				overlay,
				effectUpdated
			);
		} else {
			return this._effectHandler.updateEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
		}
	}

	async updateEffectFromNameOnToken(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: Effect,
		withSocket = true
	): Promise<boolean | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM(
				"updateEffectFromNameOnToken",
				effectName,
				uuid,
				origin,
				overlay,
				effectUpdated
			);
		} else {
			return this._effectHandler.updateEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
		}
	}

	async updateActiveEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: ActiveEffectData,
		withSocket = true
	): Promise<boolean | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM(
				"updateActiveEffectFromIdOnToken",
				effectId,
				uuid,
				origin,
				overlay,
				effectUpdated
			);
		} else {
			return this._effectHandler.updateActiveEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
		}
	}

	async updateActiveEffectFromNameOnToken(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: ActiveEffectData,
		withSocket = true
	): Promise<boolean | undefined> {
		if (withSocket && isGMConnectedAndSocketLibEnable()) {
			return this._socket.executeAsGM(
				"updateActiveEffectFromNameOnToken",
				effectName,
				uuid,
				origin,
				overlay,
				effectUpdated
			);
		} else {
			return this._effectHandler.updateActiveEffectFromNameOnToken(
				effectName,
				uuid,
				origin,
				overlay,
				effectUpdated
			);
		}
	}

	// ==================================================================

	async onManageActiveEffectFromEffectId(
		effectActions: EffectActions,
		owner: Actor | Item,
		effectId: string,
		alwaysDelete?: boolean,
		forceEnabled?: boolean,
		forceDisabled?: boolean,
		isTemporary?: boolean,
		isDisabled?: boolean,
		withSocket = true
	): Promise<Item | ActiveEffect | boolean | undefined> {
		// if (withSocket && isGMConnectedAndSocketLibEnable()) {
		//   return this._socket.executeAsGM(
		//     'onManageActiveEffectFromEffectId',
		//     effectActions,
		//     owner,
		//     effectId,
		//     alwaysDelete,
		//     forceEnabled,
		//     forceDisabled,
		//     isTemporary,
		//     isDisabled,
		//   );
		// } else {
		return this._effectHandler.onManageActiveEffectFromEffectId(
			effectActions,
			owner,
			effectId,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		// }
	}

	/**
	 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
	 * @param {MouseEvent} event      The left-click event on the effect control
	 * @param {Actor|Item} owner      The owning document which manages this effect
	 * @returns {Promise|null}        Promise that resolves when the changes are complete.
	 */
	async onManageActiveEffectFromEffect(
		effectActions: EffectActions,
		owner: Actor | Item,
		effect: Effect,
		alwaysDelete?: boolean,
		forceEnabled?: boolean,
		forceDisabled?: boolean,
		isTemporary?: boolean,
		isDisabled?: boolean,
		withSocket = true
	): Promise<Item | ActiveEffect | boolean | undefined> {
		// if (withSocket && isGMConnectedAndSocketLibEnable()) {
		//   return this._socket.executeAsGM(
		//     'onManageActiveEffectFromEffect',
		//     effectActions,
		//     owner,
		//     effect,
		//     alwaysDelete,
		//     forceEnabled,
		//     forceDisabled,
		//     isTemporary,
		//     isDisabled,
		//   );
		// } else {
		return this._effectHandler.onManageActiveEffectFromEffect(
			effectActions,
			owner,
			effect,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		// }
	}

	/**
	 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
	 * @param {MouseEvent} event      The left-click event on the effect control
	 * @param {Actor|Item} owner      The owning document which manages this effect
	 * @returns {Promise|null}        Promise that resolves when the changes are complete.
	 */
	async onManageActiveEffectFromActiveEffect(
		effectActions: EffectActions,
		owner: Actor | Item,
		activeEffect: ActiveEffect | null | undefined,
		alwaysDelete?: boolean,
		forceEnabled?: boolean,
		forceDisabled?: boolean,
		isTemporary?: boolean,
		isDisabled?: boolean,
		withSocket = true
	): Promise<Item | ActiveEffect | boolean | undefined> {
		// if (withSocket && isGMConnectedAndSocketLibEnable()) {
		//   return this._socket.executeAsGM(
		//     'onManageActiveEffectFromActiveEffect',
		//     effectActions,
		//     owner,
		//     activeEffect,
		//     alwaysDelete,
		//     forceEnabled,
		//     forceDisabled,
		//     isTemporary,
		//     isDisabled,
		//   );
		// } else {
		return this._effectHandler.onManageActiveEffectFromActiveEffect(
			effectActions,
			owner,
			activeEffect,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		// }
	}
}
