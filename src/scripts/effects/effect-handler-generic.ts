import { debugM, errorM, i18n, isStringEquals, logM, warnM } from "./effect-utility";
import FoundryHelpers from "./foundry-helpers";
import Effect from "../effects-public/effect";
import type EmbeddedCollection from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs";
import { EffectSupport } from "./effect-support";
import type { EffectChangeData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";
import type { EffectActions } from "./effect-models";
import type { EffectHandlerInterface } from "./effect-handler-interface";

export default class EffectGenericHandler implements EffectHandlerInterface {
	moduleName: string;
	_foundryHelpers: FoundryHelpers;

	constructor(moduleName: string) {
		this.moduleName = moduleName;
		this._foundryHelpers = new FoundryHelpers();
	}

	/**
	 * Toggles an effect on or off by name on an actor by UUID
	 *
	 * @param {string} effectName - name of the effect to toggle
	 * @param {boolean} overlay- if the effect is with overlay on the token
	 * @param {string[]} uuids - UUIDS of the actors to toggle the effect on
	 * @param {object} metadata - additional contextual data for the application of the effect (likely provided by midi-qol)
	 * @param {string} effectData - data of the effect to toggle (in this case is the add)
	 */
	async toggleEffect(
		effectName: string,
		overlay: boolean,
		uuids: string[],
		metadata = undefined,
		effectData: Effect | undefined = undefined
	): Promise<boolean | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'toggleEffect' : [effectName=${effectName},overlay=${overlay},uuids=${String(
				uuids
			)},metadata=${String(metadata)}]`
		);
		const effectNames: string[] = [];
		for (const uuid of uuids) {
			if (this.hasEffectApplied(effectName, uuid)) {
				await this.removeEffect(effectName, uuid);
			} else {
				const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
				const origin = `Actor.${actor.id}`;
				await this.addEffect(effectName, <Effect>effectData, uuid, origin, overlay, metadata);
			}
		}
		debugM(
			this.moduleName,
			`END Effect Handler 'toggleEffect' : [effectName=${effectName},overlay=${overlay},effectNames=${String(
				effectNames
			)},metadata=${String(metadata)}]`
		);
		return true;
	}

	/**
	 * Toggles an effect on or off by name on an actor by UUID
	 *
	 * @param {string} effectName - name of the effect to toggle
	 * @param {object} params - the effect parameters
	 * @param {string} params.overlay - name of the effect to toggle
	 * @param {string[]} params.uuids - UUIDS of the actors to toggle the effect on
	 */
	async toggleEffectArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "toggleEffectArr | inAttributes must be of type array");
		}
		const [effectName, overlay, uuids, metadata, effectData] = inAttributes;
		return this.toggleEffect(effectName, overlay, uuids, metadata, effectData);
	}

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is
	 * applied to
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectApplied(effectName: string, uuid: string): boolean {
		debugM(
			this.moduleName,
			`START Effect Handler 'hasEffectApplied' : [effectName=${effectName},uuid=${String(uuid)}]`
		);
		const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>actor?.effects || [];
		//@ts-ignore
		const isApplied = actorEffects?.some((activeEffect) => {
			//@ts-ignore
			if (isStringEquals(activeEffect?.label, effectName) && !activeEffect?.disabled) {
				return true;
			} else {
				return false;
			}
		});
		debugM(
			this.moduleName,
			`END Effect Handler 'hasEffectApplied' : [effectName=${effectName},actorName=${String(actor.name)}]`
		);
		return isApplied;
	}

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is
	 * applied to
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedArr(...inAttributes: any[]): boolean {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "hasEffectAppliedArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		return this.hasEffectApplied(effectName, uuid);
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffect(effectName: string, uuid: string): Promise<ActiveEffect | undefined> {
		const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>actor?.effects || [];
		//@ts-ignore
		const effectToRemove = actorEffects.find(
			//@ts-ignore
			(activeEffect) => activeEffect?.label === effectName
		);

		if (!effectToRemove) {
			debugM(
				this.moduleName,
				`Can't find effect to remove with name ${effectName} from ${actor.name} - ${actor.id}`
			);
			return undefined;
		}
		const activeEffectsRemoved = <ActiveEffect[]>(
			await actor.deleteEmbeddedDocuments("ActiveEffect", [<string>effectToRemove.id])
		);
		logM(this.moduleName, `Removed effect ${effectName} from ${actor.name} - ${actor.id}`);
		return activeEffectsRemoved[0];
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "removeEffectArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		return this.removeEffect(effectName, uuid);
	}

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {string} effectName - the name of the effect to add
	 * @param {object} effectData - the effect data to add if effectName is not provided
	 * @param {string} uuid - the uuid of the actor to add the effect to
	 * @param {string} origin - the origin of the effect
	 * @param {boolean} overlay - if the effect is an overlay or not
	 * @param {object} metadata - additional contextual data for the application of the effect (likely provided by midi-qol)
	 */
	async addEffect(
		effectName: string | undefined | null,
		effectData: Effect,
		uuid: string,
		origin: string,
		overlay = false,
		metadata = undefined
	): Promise<ActiveEffect | undefined> {
		const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
		let effect = <Effect>this._findEffectByName(effectName, actor);

		if (!effect && effectData) {
			effect = new Effect(effectData);
		}

		if (!origin) {
			origin = `Actor.${actor.id}`;
		}

		this._handleIntegrations(effect);

		effect.origin = effectData.origin ? effectData.origin : origin;
		effect.overlay =
			String(effectData.overlay) === "false" || String(effectData.overlay) === "true"
				? effectData.overlay
				: String(overlay) === "false" || String(overlay) === "true"
				? overlay
				: false;
		const activeEffectFounded = <ActiveEffect>await this.findEffectByNameOnActor(effectName, uuid);
		if (activeEffectFounded) {
			warnM(
				this.moduleName,
				`Can't add the effect with name ${effectName} on actor ${actor.name}, because is already added`
			);
			return undefined;
		}
		const activeEffectData = EffectSupport.convertToActiveEffectData(effect);
		const activeEffectsAdded = <ActiveEffect[]>(
			await actor.createEmbeddedDocuments("ActiveEffect", [activeEffectData])
		);
		logM(this.moduleName, `Added effect ${effect.name} to ${actor.name} - ${actor.id}`);
		return activeEffectsAdded[0];
	}

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {object} params - the effect parameters
	 * @param {string} params.effectName - the name of the effect to add
	 * @param {string} params.uuid - the uuid of the actor to add the effect to
	 * @param {string} params.origin - the origin of the effect
	 * @param {boolean} params.overlay - if the effect is an overlay or not
	 */
	async addEffectArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "addEffectArr | inAttributes must be of type array");
		}
		const [effectName, effectData, uuid, origin, overlay, metadata] = inAttributes;
		return this.addEffect(effectName, effectData, uuid, origin, overlay, metadata);
	}

	_handleIntegrations(effect: Effect): EffectChangeData[] {
		return EffectSupport._handleIntegrations(effect);
	}

	// ============================================================
	// Additional feature for retrocompatibility
	// ============================================================

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	_findEffectByName(effectName: string | undefined | null, actor: Actor): Effect | undefined {
		if (!effectName) {
			return undefined;
		}

		let effect: Effect | undefined;
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>actor?.effects || [];
		for (const effectEntity of actorEffects) {
			//@ts-ignore
			const effectNameToSet = effectEntity.label;
			if (!effectNameToSet) {
				continue;
			}
			if (isStringEquals(effectNameToSet, effectName)) {
				effect = EffectSupport.convertActiveEffectToEffect(effectEntity);
			}
		}

		return effect;
	}

	// convertToEffectClass(effect: ActiveEffect): Effect {
	//   const atlChanges = effect.changes.filter((changes) => changes.key.startsWith('ATL'));
	//   const tokenMagicChanges = effect.changes.filter((changes) => changes.key === 'macro.tokenMagic');
	//   const changes = effect.changes.filter(
	//     (change) => !change.key.startsWith('ATL') && change.key !== 'macro.tokenMagic',
	//   );

	//   return new Effect({
	//     customId: <string>effect.id,
	//     name: effect.label,
	//     description: <string>effect.flags.customEffectDescription,
	//     icon: <string>effect.icon,
	//     tint: <string>effect.tint,
	//     seconds: effect.duration.seconds,
	//     rounds: effect.duration.rounds,
	//     turns: effect.duration.turns,
	//     flags: effect.flags,
	//     changes,
	//     atlChanges,
	//     tokenMagicChanges,
	//   });
	// }

	// ====================================================================
	// ACTOR MANAGEMENT
	// ====================================================================

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByNameOnActor(
		effectName: string | undefined | null,
		uuid: string
	): Promise<ActiveEffect | undefined> {
		if (effectName) {
			effectName = i18n(effectName);
		}
		const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
		let effect: ActiveEffect | null | undefined = undefined;
		if (!effectName) {
			return effect;
		}
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>actor?.effects || [];
		for (const effectEntity of actorEffects) {
			//@ts-ignore
			const effectNameToSet = effectEntity.label;
			if (!effectNameToSet) {
				continue;
			}
			if (isStringEquals(effectNameToSet, effectName)) {
				effect = effectEntity;
				break;
			}
		}
		return effect;
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByIdOnActor(effectId: string | undefined | null, uuid: string): Promise<ActiveEffect | undefined> {
		if (effectId) {
			effectId = i18n(effectId);
		}
		const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
		let effect: ActiveEffect | null | undefined = undefined;
		if (!effectId) {
			return effect;
		}
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>actor?.effects || [];
		for (const effectEntity of actorEffects) {
			const effectIdToSet = effectEntity.id;
			if (!effectIdToSet) {
				continue;
			}
			if (isStringEquals(effectIdToSet, effectId)) {
				effect = effectEntity;
				break;
			}
		}
		return effect;
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByNameOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | null | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "findEffectByNameOnActorArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		return this.findEffectByNameOnActor(effectName, uuid);
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByIdOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | null | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "findEffectByIdOnActorArr | inAttributes must be of type array");
		}
		const [effectId, uuid] = inAttributes;
		return this.findEffectByIdOnActor(effectId, uuid);
	}

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedOnActor(effectName: string, uuid: string, includeDisabled = false): boolean {
		if (effectName) {
			effectName = i18n(effectName);
		}
		const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>actor?.effects || [];
		const isApplied = actorEffects.some((activeEffect) => {
			if (includeDisabled) {
				//@ts-ignore
				if (isStringEquals(activeEffect?.label, effectName)) {
					return true;
				} else {
					return false;
				}
			} else {
				//@ts-ignore
				if (isStringEquals(activeEffect?.label, effectName) && !activeEffect?.disabled) {
					return true;
				} else {
					return false;
				}
			}
		});
		return isApplied;
	}

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedOnActorArr(...inAttributes: any[]): boolean {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "hasEffectAppliedOnActorArr | inAttributes must be of type array");
		}
		const [effectName, uuid, includeDisabled] = inAttributes;
		return this.hasEffectAppliedOnActor(effectName, uuid, includeDisabled);
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
	hasEffectAppliedFromIdOnActor(effectId: string, uuid: string, includeDisabled = false): boolean {
		const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>actor?.effects || [];
		const isApplied = actorEffects.some((activeEffect) => {
			if (includeDisabled) {
				if (<string>activeEffect?.id === effectId) {
					return true;
				} else {
					return false;
				}
			} else {
				//@ts-ignore
				if (<string>activeEffect?.id === effectId && !activeEffect.disabled) {
					return true;
				} else {
					return false;
				}
			}
		});
		return isApplied;
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
	hasEffectAppliedFromIdOnActorArr(...inAttributes: any[]): boolean {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "hasEffectAppliedFromIdOnActorArr | inAttributes must be of type array");
		}
		const [effectId, uuid, includeDisabled] = inAttributes;
		return this.hasEffectAppliedFromIdOnActor(effectId, uuid, includeDisabled);
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectOnActor(effectName: string, uuid: string): Promise<ActiveEffect | undefined> {
		if (effectName) {
			effectName = i18n(effectName);
		}
		const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>actor?.effects || [];
		const effectToRemove = <
			ActiveEffect //@ts-ignore
		>actorEffects.find((activeEffect) => <string>activeEffect?.label === effectName);

		if (!effectToRemove) {
			debugM(
				this.moduleName,
				`Can't find effect to remove with name ${effectName} from ${actor.name} - ${actor.id}`
			);
			return undefined;
		}
		const activeEffectsRemoved = <ActiveEffect[]>(
			await actor.deleteEmbeddedDocuments("ActiveEffect", [<string>effectToRemove.id])
		);
		logM(this.moduleName, `Removed effect ${effectName} from ${actor.name} - ${actor.id}`);
		return activeEffectsRemoved[0];
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "removeEffectOnActorArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		return this.removeEffectOnActor(effectName, uuid);
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectFromIdOnActor(effectId: string, uuid: string): Promise<ActiveEffect | undefined> {
		const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
		if (effectId) {
			//@ts-ignore
			const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>actor?.effects || [];
			// Why i need this ??? for avoid the double AE
			const effectToRemove = <ActiveEffect>(
				actorEffects.find((activeEffect) => <string>activeEffect.id === effectId)
			);
			if (!effectToRemove) {
				debugM(
					this.moduleName,
					`Can't find effect to remove with id ${effectId} from ${actor.name} - ${actor.id}`
				);
				return undefined;
			}
			const activeEffectsRemoved = <ActiveEffect[]>(
				await actor.deleteEmbeddedDocuments("ActiveEffect", [<string>effectToRemove.id])
			);
			//@ts-ignore
			logM(this.moduleName, `Removed effect ${effectToRemove?.label} from ${actor.name} - ${actor.id}`);
			return activeEffectsRemoved[0];
		} else {
			debugM(this.moduleName, `Can't removed effect without id from ${actor.name} - ${actor.id}`);
			return undefined;
		}
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectFromIdOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "removeEffectFromIdOnActor | inAttributes must be of type array");
		}
		const [effectId, uuid] = inAttributes;
		return this.removeEffectFromIdOnActor(effectId, uuid);
	}

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {object} params - the effect parameters
	 * @param {string} params.effectName - the name of the effect to add
	 * @param {string} params.uuid - the uuid of the actor to add the effect to
	 * @param {string} params.origin - the origin of the effect
	 * @param {boolean} params.overlay - if the effect is an overlay or not
	 */
	async addEffectOnActor(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effect: Effect | null | undefined
	): Promise<ActiveEffect | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'addEffectOnActor' : [effectName=${effectName},uuid=${uuid},origin=${origin},overlay=${overlay},effect=${effect}]`
		);
		if (effectName) {
			effectName = i18n(effectName);
		}
		if (effect) {
			const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
			if (!origin) {
				origin = `Actor.${actor.id}`;
			}
			effect.origin = effect.origin ? effect.origin : origin;
			effect.overlay =
				String(effect.overlay) === "false" || String(effect.overlay) === "true"
					? effect.overlay
					: String(overlay) === "false" || String(overlay) === "true"
					? overlay
					: false;
			const activeEffectFounded = <ActiveEffect>await this.findEffectByNameOnActor(effectName, uuid);
			if (activeEffectFounded) {
				warnM(
					this.moduleName,
					`Can't add the effect with name ${effectName} on actor ${actor.name}, because is already added`
				);
				return undefined;
			}
			const activeEffectData = EffectSupport.convertToActiveEffectData(effect);
			const activeEffectsAdded = <ActiveEffect[]>(
				await actor.createEmbeddedDocuments("ActiveEffect", [activeEffectData])
			);
			logM(
				this.moduleName,
				`Added effect ${effect.name ? effect.name : effectName} to ${actor.name} - ${actor.id}`
			);
			return activeEffectsAdded[0];
		}
		warnM(this.moduleName, `No effect object is been passed`);
		return undefined;
	}

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {string} effectName - the name of the effect to add
	 * @param {string} uuid - the uuid of the actor to add the effect to
	 */
	async addEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "addEffectOnActorArr | inAttributes must be of type array");
		}
		const [effectName, uuid, origin, overlay, effect] = inAttributes;
		return this.addEffectOnActor(effectName, uuid, origin, overlay, effect);
	}

	/**
	 * @href https://github.com/ElfFriend-DnD/foundryvtt-temp-effects-as-statuses/blob/main/scripts/temp-effects-as-statuses.js
	 */
	async toggleEffectFromIdOnActor(
		effectId: string,
		uuid: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		overlay?: boolean | undefined
	): Promise<boolean | undefined> {
		const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>actor?.effects || [];
		const activeEffect = <ActiveEffect>actorEffects.find((entity: ActiveEffect) => {
			return <string>entity.id === effectId;
		});

		if (!activeEffect) {
			return undefined;
		}

		if (String(overlay) === "false" || String(overlay) === "true") {
			// DO NOTHING
		} else {
			//@ts-ignore
			if (!activeEffect.flags) {
				//@ts-ignore
				activeEffect.flags = {};
			}
			//@ts-ignore
			if (!activeEffect.flags.core) {
				//@ts-ignore
				activeEffect.flags.core = {};
			}
			//@ts-ignore
			overlay = activeEffect.flags.core.overlay;
			if (!overlay) {
				overlay = false;
			}
		}

		// nuke it if it has a statusId
		// brittle assumption
		// provides an option to always do this
		// if (activeEffect.getFlag('core', 'statusId') || alwaysDelete) {
		if (String(alwaysDelete) === "true") {
			const deleted = await activeEffect.delete();
			return !!deleted;
		}
		let updated;
		//@ts-ignore
		if (String(forceEnabled) === "true" && activeEffect.disabled) {
			updated = await activeEffect.update({
				disabled: false,
				flags: {
					core: {
						//@ts-ignore
						statusId: activeEffect._id,
						overlay: overlay,
					},
				},
			});
			//@ts-ignore
		} else if (String(forceDisabled) === "true" && !activeEffect.disabled) {
			updated = await activeEffect.update({
				disabled: true,
				flags: {
					core: {
						//@ts-ignore
						statusId: activeEffect._id,
						overlay: overlay,
					},
				},
			});
		} else {
			// otherwise toggle its disabled status
			updated = await activeEffect.update({
				//@ts-ignore
				disabled: !activeEffect.disabled,
				flags: {
					core: {
						//@ts-ignore
						statusId: activeEffect._id,
						overlay: overlay,
					},
				},
			});
		}

		return !!updated;
	}

	async toggleEffectFromIdOnActorArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "toggleEffectFromIdOnActorArr | inAttributes must be of type array");
		}
		const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay] = inAttributes;
		return this.toggleEffectFromIdOnActor(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
	}

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {string} uuid - the uuid of the actor to add the effect to
	 * @param {string} activeEffectData - the name of the effect to add
	 */
	async addActiveEffectOnActor(uuid: string, activeEffectData: ActiveEffect): Promise<ActiveEffect | undefined> {
		if (activeEffectData) {
			const actor = <Actor>this._foundryHelpers.getActorByUuid(uuid);
			//@ts-ignore
			if (!activeEffectData.origin) {
				//@ts-ignore
				activeEffectData.origin = `Actor.${actor.id}`;
			}
			const activeEffectsAdded = <ActiveEffect[]>(
				await actor.createEmbeddedDocuments("ActiveEffect", [<Record<string, any>>activeEffectData])
			);
			//@ts-ignore
			logM(this.moduleName, `Added effect ${activeEffectData.label} to ${actor.name} - ${actor.id}`);
			return activeEffectsAdded[0];
		} else {
			return undefined;
		}
	}

	async addActiveEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "addActiveEffectOnActorArr | inAttributes must be of type array");
		}
		const [uuid, activeEffectData] = inAttributes;
		return this.addActiveEffectOnActor(uuid, activeEffectData);
	}

	// ====================================================================
	// TOKEN MANAGEMENT
	// ====================================================================

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByNameOnToken(effectName: string, uuid: string): Promise<ActiveEffect | undefined> {
		if (effectName) {
			effectName = i18n(effectName);
		}
		const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
		let effect: ActiveEffect | undefined = undefined;
		if (!effectName) {
			return effect;
		}
		for (const effectEntity of actorEffects) {
			//@ts-ignore
			const effectNameToSet = effectEntity.label;
			if (!effectNameToSet) {
				continue;
			}
			if (isStringEquals(effectNameToSet, effectName)) {
				effect = effectEntity;
				break;
			}
		}
		return effect;
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectId - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByIdOnToken(effectId: string, uuid: string): Promise<ActiveEffect | undefined> {
		if (effectId) {
			effectId = i18n(effectId);
		}
		const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
		let effect: ActiveEffect | undefined = undefined;
		if (!effectId) {
			return effect;
		}
		for (const effectEntity of actorEffects) {
			//@ts-ignore
			const effectIdToSet = effectEntity.id;
			if (!effectIdToSet) {
				continue;
			}
			if (isStringEquals(effectIdToSet, effectId)) {
				effect = effectEntity;
				break;
			}
		}
		return effect;
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByNameOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "findEffectByNameOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		return this.findEffectByNameOnToken(effectName, uuid);
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByIdOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "findEffectByIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		return this.findEffectByIdOnToken(effectName, uuid);
	}

	/**
	 * Checks to see if any of the current active effects applied to the token
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the token to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedOnToken(effectName: string, uuid: string, includeDisabled = false): boolean {
		if (effectName) {
			effectName = i18n(effectName);
		}
		const token = this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
		const isApplied = actorEffects.some((activeEffect) => {
			if (includeDisabled) {
				//@ts-ignore
				if (isStringEquals(activeEffect?.label, effectName)) {
					return true;
				} else {
					return false;
				}
			} else {
				//@ts-ignore
				if (isStringEquals(activeEffect?.label, effectName) && !activeEffect.disabled) {
					return true;
				} else {
					return false;
				}
			}
		});
		return isApplied;
	}

	/**
	 * Checks to see if any of the current active effects applied to the token
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the token to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedOnTokenArr(...inAttributes: any[]): boolean {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "hasEffectAppliedOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid, includeDisabled] = inAttributes;
		return this.hasEffectAppliedOnToken(effectName, uuid, includeDisabled);
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
	hasEffectAppliedFromIdOnToken(effectId: string, uuid: string, includeDisabled = false): boolean {
		const token = this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents ?? [];
		const isApplied = actorEffects.some((activeEffect) => {
			if (includeDisabled) {
				//@ts-ignore
				if (activeEffect._id === effectId) {
					return true;
				} else {
					return false;
				}
			} else {
				//@ts-ignore
				if (activeEffect._id === effectId && !activeEffect.disabled) {
					return true;
				} else {
					return false;
				}
			}
		});
		return isApplied;
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
	hasEffectAppliedFromIdOnTokenArr(...inAttributes: any[]): boolean {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "hasEffectAppliedFromIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectId, uuid, includeDisabled] = inAttributes;
		return this.hasEffectAppliedFromIdOnToken(effectId, uuid, includeDisabled);
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectOnToken(effectName: string, uuid: string): Promise<ActiveEffect | undefined> {
		if (effectName) {
			effectName = i18n(effectName);
		}
		const token = this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
		const effectToRemove = <
			ActiveEffect //@ts-ignore
		>actorEffects.find((activeEffect) => <string>activeEffect?.label === effectName);

		if (!effectToRemove) {
			debugM(
				this.moduleName,
				`Can't find effect to remove with name ${effectName} from ${token.name} - ${token.id}`
			);
			return undefined;
		}
		const activeEffectsRemoved = <ActiveEffect[]>(
			await token.actor?.deleteEmbeddedDocuments("ActiveEffect", [<string>effectToRemove.id])
		);
		logM(this.moduleName, `Removed effect ${effectName} from ${token.name} - ${token.id}`);
		return activeEffectsRemoved[0];
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "removeEffectOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid] = inAttributes;
		return this.removeEffectOnToken(effectName, uuid);
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectFromIdOnToken(effectId: string, uuid: string): Promise<ActiveEffect | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'removeEffectFromIdOnToken' : [effectId=${effectId},uuid=${uuid}]`
		);
		if (effectId) {
			const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
			const actorEffects =
				//@ts-ignore
				<EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
			const effectToRemove = <ActiveEffect>actorEffects.find(
				//@ts-ignore
				(activeEffect) => <string>activeEffect?._id === effectId
			);
			if (effectToRemove) {
				const activeEffectsRemoved = <ActiveEffect[]>(
					await token.actor?.deleteEmbeddedDocuments("ActiveEffect", [<string>effectToRemove.id])
				);
				//@ts-ignore
				logM(this.moduleName, `Removed effect ${effectToRemove?.label} from ${token.name} - ${token.id}`);
				return activeEffectsRemoved[0];
			}
		}
		warnM(this.moduleName, `No effect id is been passed`);
		return undefined;
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "removeEffectFromIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectId, uuid] = inAttributes;
		return this.removeEffectFromIdOnToken(effectId, uuid);
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectFromIdOnTokenMultiple(effectIds: string[], uuid: string): Promise<ActiveEffect | undefined> {
		if (effectIds) {
			const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
			const effectIdsTmp: string[] = [];
			const actorEffects =
				//@ts-ignore
				<EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
			for (const effectIdTmp of effectIds) {
				const effectToRemove = <
					ActiveEffect //@ts-ignore
				>actorEffects.find((activeEffect) => <string>activeEffect?._id === effectIdTmp);
				if (effectToRemove) {
					effectIdsTmp.push(effectIdTmp);
				}
			}
			const activeEffectsRemoved = <ActiveEffect[]>(
				await token.actor?.deleteEmbeddedDocuments("ActiveEffect", effectIdsTmp)
			);
			logM(this.moduleName, `Removed effect ${effectIds.join(",")} from ${token.name} - ${token.id}`);
			return activeEffectsRemoved[0];
		}
		warnM(this.moduleName, `No array of effect id is been passed`);
		return undefined;
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectFromIdOnTokenMultipleArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "removeEffectFromIdOnTokenMultipleArr | inAttributes must be of type array");
		}
		const [effectIds, uuid] = inAttributes;
		return this.removeEffectFromIdOnTokenMultiple(effectIds, uuid);
	}

	/**
	 * Adds the effect with the provided name to an token matching the provided
	 * UUID
	 *
	 * @param {object} params - the effect parameters
	 * @param {string} params.effectName - the name of the effect to add
	 * @param {string} params.uuid - the uuid of the token to add the effect to
	 * @param {string} params.origin - the origin of the effect
	 * @param {boolean} params.overlay - if the effect is an overlay or not
	 */
	async addEffectOnToken(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effect: Effect | null | undefined
	): Promise<ActiveEffect | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'addEffectOnActor' : [effectName=${effectName},uuid=${uuid},origin=${origin},overlay=${overlay},effect=${effect}]`
		);
		if (effectName) {
			effectName = i18n(effectName);
		}
		if (effect) {
			const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
			if (!origin) {
				const sceneId = (token?.scene && token.scene.id) || canvas.scene?.id;
				origin = token.actor ? `Actor.${token.actor?.id}` : `Scene.${sceneId}.Token.${token.id}`;
			}
			effect.origin = effect.origin ? effect.origin : origin;
			effect.overlay =
				String(effect.overlay) === "false" || String(effect.overlay) === "true"
					? effect.overlay
					: String(overlay) === "false" || String(overlay) === "true"
					? overlay
					: false;
			const activeEffectFounded = <ActiveEffect>await this.findEffectByNameOnToken(effectName, uuid);
			if (activeEffectFounded) {
				warnM(
					this.moduleName,
					`Can't add the effect with name ${effectName} on token ${token.name}, because is already added`
				);
				return activeEffectFounded;
			}
			const activeEffectData = EffectSupport.convertToActiveEffectData(effect);
			const activeEffectsAdded = <ActiveEffect[]>(
				await token.actor?.createEmbeddedDocuments("ActiveEffect", [activeEffectData])
			);
			logM(
				this.moduleName,
				`Added effect ${effect.name ? effect.name : effectName} to ${token.name} - ${token.id}`
			);
			return activeEffectsAdded[0];
		}
		warnM(this.moduleName, `No effect object is been passed`);
		return undefined;
	}

	/**
	 * Adds the effect with the provided name to an token matching the provided
	 * UUID
	 *
	 * @param {string} effectName - the name of the effect to add
	 * @param {string} uuid - the uuid of the token to add the effect to
	 */
	async addEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "addEffectOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid, origin, overlay, effect] = inAttributes;
		return this.addEffectOnToken(effectName, uuid, origin, overlay, effect);
	}

	/**
	 * @href https://github.com/ElfFriend-DnD/foundryvtt-temp-effects-as-statuses/blob/main/scripts/temp-effects-as-statuses.js
	 */
	async toggleEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		overlay?: boolean | undefined
	): Promise<boolean | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'toggleEffectFromIdOnToken' : [effectId=${effectId},uuid=${uuid},alwaysDelete=${alwaysDelete},forceEnabled=${forceEnabled},forceDisabled=${forceDisabled},overlay=${overlay}]`
		);
		const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
		const activeEffect = <ActiveEffect>actorEffects.find(
			//@ts-ignore
			(activeEffect) => <string>activeEffect?._id === effectId
		);

		if (!activeEffect) {
			return undefined;
		}

		if (String(overlay) === "false" || String(overlay) === "true") {
			// DO NOTHING
		} else {
			//@ts-ignore
			if (!activeEffect.flags) {
				//@ts-ignore
				activeEffect.flags = {};
			}
			//@ts-ignore
			if (!activeEffect.flags.core) {
				//@ts-ignore
				activeEffect.flags.core = {};
			}
			//@ts-ignore
			overlay = activeEffect.flags.core.overlay;
			if (!overlay) {
				overlay = false;
			}
		}

		// nuke it if it has a statusId
		// brittle assumption
		// provides an option to always do this
		if (String(alwaysDelete) === "true") {
			const deleted = await activeEffect.delete();
			return !!deleted;
		}
		let updated;
		//@ts-ignore
		if (String(forceEnabled) === "true" && activeEffect.disabled) {
			updated = await activeEffect.update({
				disabled: false,
				flags: {
					core: {
						//@ts-ignore
						statusId: activeEffect._id,
						overlay: overlay,
					},
				},
			});
			//@ts-ignore
		} else if (String(forceDisabled) === "true" && !activeEffect.disabled) {
			updated = await activeEffect.update({
				disabled: true,
				flags: {
					core: {
						//@ts-ignore
						statusId: activeEffect._id,
						overlay: overlay,
					},
				},
			});
		} else {
			// otherwise toggle its disabled status
			updated = await activeEffect.update({
				//@ts-ignore
				disabled: !activeEffect.disabled,
				flags: {
					core: {
						//@ts-ignore
						statusId: activeEffect._id,
						overlay: overlay,
					},
				},
			});
		}
		debugM(
			this.moduleName,
			`END Effect Handler 'toggleEffectFromIdOnToken' : [effectName=${activeEffect.name},tokenName=${token.name},alwaysDelete=${alwaysDelete},forceEnabled=${forceEnabled},forceDisabled=${forceDisabled},overlay=${overlay}]`
		);
		return !!updated;
	}

	/**
	 * @href https://github.com/ElfFriend-DnD/foundryvtt-temp-effects-as-statuses/blob/main/scripts/temp-effects-as-statuses.js
	 */
	async toggleEffectFromDataOnToken(
		effect: Effect,
		uuid: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		overlay?: boolean | undefined
	): Promise<boolean | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'toggleEffectFromIdOnToken' : [effect=${effect},uuid=${uuid},alwaysDelete=${alwaysDelete},forceEnabled=${forceEnabled},forceDisabled=${forceDisabled},overlay=${overlay}]`
		);
		const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
		const activeEffect = <ActiveEffect>actorEffects.find((activeEffect) => {
			return (
				//@ts-ignore
				isStringEquals(<string>activeEffect?._id, effect.customId) ||
				//@ts-ignore
				isStringEquals(<string>activeEffect?.label, effect.name)
			);
		});

		if (!activeEffect) {
			return undefined;
		}

		if (String(overlay) === "false" || String(overlay) === "true") {
			// DO NOTHING
		} else {
			//@ts-ignore
			if (!activeEffect.flags) {
				//@ts-ignore
				activeEffect.flags = {};
			}
			//@ts-ignore
			if (!activeEffect.flags.core) {
				//@ts-ignore
				activeEffect.flags.core = {};
			}
			//@ts-ignore
			overlay = activeEffect.flags.core.overlay;
			if (!overlay) {
				overlay = false;
			}
		}

		// nuke it if it has a statusId
		// brittle assumption
		// provides an option to always do this
		if (String(alwaysDelete) === "true") {
			const deleted = await activeEffect.delete();
			return !!deleted;
		}
		let updated;
		//@ts-ignore
		if (String(forceEnabled) === "true" && activeEffect.disabled) {
			updated = await activeEffect.update({
				disabled: false,
				flags: {
					core: {
						//@ts-ignore
						statusId: activeEffect._id,
						overlay: overlay,
					},
				},
			});
			//@ts-ignore
		} else if (String(forceDisabled) === "true" && !activeEffect.disabled) {
			updated = await activeEffect.update({
				disabled: true,
				flags: {
					core: {
						//@ts-ignore
						statusId: activeEffect._id,
						overlay: overlay,
					},
				},
			});
		} else {
			// otherwise toggle its disabled status
			updated = await activeEffect.update({
				//@ts-ignore
				disabled: !activeEffect.disabled,
				flags: {
					core: {
						//@ts-ignore
						statusId: activeEffect._id,
						overlay: overlay,
					},
				},
			});
		}
		debugM(
			this.moduleName,
			`END Effect Handler 'toggleEffectFromIdOnToken' : [effectName=${activeEffect.name},tokenName=${token.name},alwaysDelete=${alwaysDelete},forceEnabled=${forceEnabled},forceDisabled=${forceDisabled},overlay=${overlay}]`
		);
		return !!updated;
	}

	async toggleEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "toggleEffectFromIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay] = inAttributes;
		return this.toggleEffectFromIdOnToken(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
	}

	/**
	 * Adds the effect with the provided name to an token matching the provided
	 * UUID
	 *
	 * @param {string} uuid - the uuid of the token to add the effect to
	 * @param {string} activeEffectData - the name of the effect to add
	 */
	async addActiveEffectOnToken(uuid: string, activeEffectData: ActiveEffect): Promise<ActiveEffect | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'addActiveEffectOnToken' : [uuid=${uuid},activeEffectData=${activeEffectData}]`
		);
		if (activeEffectData) {
			const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
			//@ts-ignore
			if (!activeEffectData.origin) {
				const sceneId = (token?.scene && token.scene.id) || canvas.scene?.id;
				const origin = token.actor ? `Actor.${token.actor?.id}` : `Scene.${sceneId}.Token.${token.id}`;
				//@ts-ignore
				activeEffectData.origin = origin;
			}
			const activeEffetsAdded = <ActiveEffect[]>(
				await token.actor?.createEmbeddedDocuments("ActiveEffect", [<Record<string, any>>activeEffectData])
			);
			//@ts-ignore
			logM(this.moduleName, `Added effect ${activeEffectData.label} to ${token.name} - ${token.id}`);
			debugM(
				this.moduleName,
				`END Effect Handler 'addActiveEffectOnToken' : [uuid=${uuid},activeEffectData=${activeEffectData}]`
			);
			return activeEffetsAdded[0];
		}
		warnM(this.moduleName, `No active effect data is been passed`);
		return undefined;
	}

	async addActiveEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "addActiveEffectOnTokenArr | inAttributes must be of type array");
		}
		const [uuid, activeEffectData] = inAttributes;
		return this.addActiveEffectOnToken(uuid, activeEffectData);
	}

	async updateEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: Effect
	): Promise<boolean | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'updateEffectFromIdOnToken' : [effectId=${effectId}, uuid=${uuid}, origin=${origin}, overlay=${overlay}, effectUpdated=${effectUpdated}]`
		);
		const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
		const activeEffect = <
			ActiveEffect //@ts-ignore
		>actorEffects.find((activeEffect) => <string>activeEffect?._id === effectId);

		if (!activeEffect) {
			return undefined;
		}
		if (!origin) {
			const sceneId = (token?.scene && token.scene.id) || canvas.scene?.id;
			origin = token.actor ? `Actor.${token.actor?.id}` : `Scene.${sceneId}.Token.${token.id}`;
		}
		effectUpdated.origin = origin;
		effectUpdated.overlay = String(overlay) === "false" || String(overlay) === "true" ? overlay : false;
		const activeEffectDataUpdated = EffectSupport.convertToActiveEffectData(effectUpdated);
		activeEffectDataUpdated._id = activeEffect.id;
		const updated = await token.actor?.updateEmbeddedDocuments("ActiveEffect", [activeEffectDataUpdated]);
		//@ts-ignore
		logM(this.moduleName, `Updated effect ${activeEffect.label} to ${token.name} - ${token.id}`);
		debugM(
			this.moduleName,
			`END Effect Handler 'updateEffectFromIdOnToken' : [effectId=${effectId}, uuid=${uuid}, origin=${origin}, overlay=${overlay}, effectUpdated=${effectUpdated}]`
		);
		return !!updated;
	}

	async updateEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "updateEffectFromIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectId, uuid, origin, overlay, effectUpdated] = inAttributes;
		return this.updateEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
	}

	async updateEffectFromNameOnToken(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: Effect
	): Promise<boolean | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'updateEffectFromNameOnToken' : [effectName=${effectName}, uuid=${uuid}, origin=${origin}, overlay=${overlay}, effectUpdated=${effectUpdated}]`
		);
		const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
		const activeEffect = <
			ActiveEffect //@ts-ignore
		>actorEffects.find((activeEffect) => isStringEquals(<string>activeEffect?.label, effectName));

		if (!activeEffect) {
			return undefined;
		}
		if (!origin) {
			const sceneId = (token?.scene && token.scene.id) || canvas.scene?.id;
			origin = token.actor ? `Actor.${token.actor?.id}` : `Scene.${sceneId}.Token.${token.id}`;
		}
		effectUpdated.origin = origin;
		effectUpdated.overlay = String(overlay) === "false" || String(overlay) === "true" ? overlay : false;
		const activeEffectDataUpdated = EffectSupport.convertToActiveEffectData(effectUpdated);
		activeEffectDataUpdated._id = activeEffect.id;
		const updated = await token.actor?.updateEmbeddedDocuments("ActiveEffect", [activeEffectDataUpdated]);
		//@ts-ignore
		logM(this.moduleName, `Updated effect ${activeEffect.label} to ${token.name} - ${token.id}`);
		debugM(
			this.moduleName,
			`END Effect Handler 'updateEffectFromNameOnToken' : [effectName=${effectName}, uuid=${uuid}, origin=${origin}, overlay=${overlay}, effectUpdated=${effectUpdated}]`
		);
		return !!updated;
	}

	async updateEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "updateEffectFromNameOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid, origin, overlay, effectUpdated] = inAttributes;
		return this.updateEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
	}

	async updateActiveEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: ActiveEffect
	): Promise<boolean | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'updateActiveEffectFromIdOnToken' : [effectId=${effectId}, uuid=${uuid}, origin=${origin}, overlay=${overlay}, effectUpdated=${effectUpdated}]`
		);
		const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
		const activeEffect = <
			ActiveEffect //@ts-ignore
		>actorEffects.find((activeEffect) => <string>activeEffect?._id === effectId);

		if (!activeEffect) {
			return undefined;
		}

		if (String(overlay) === "false" || String(overlay) === "true") {
			// DO NOTHING
		} else {
			//@ts-ignore
			if (!activeEffect.flags) {
				//@ts-ignore
				activeEffect.flags = {};
			}
			//@ts-ignore
			if (!activeEffect.flags.core) {
				//@ts-ignore
				activeEffect.flags.core = {};
			}
			//@ts-ignore
			overlay = activeEffect.flags.core.overlay;
			if (!overlay) {
				overlay = false;
			}
		}

		if (!origin) {
			const sceneId = (token?.scene && token.scene.id) || canvas.scene?.id;
			origin = token.actor ? `Actor.${token.actor?.id}` : `Scene.${sceneId}.Token.${token.id}`;
		}
		const activeEffectDataUpdated = effectUpdated;
		//@ts-ignore
		const updated = await token.actor?.updateEmbeddedDocuments("ActiveEffect", [activeEffectDataUpdated]);
		//@ts-ignore
		logM(this.moduleName, `Updated effect ${activeEffect.label} to ${token.name} - ${token.id}`);
		debugM(
			this.moduleName,
			`END Effect Handler 'updateActiveEffectFromIdOnToken' : [effectId=${effectId}, uuid=${uuid}, origin=${origin}, overlay=${overlay}, effectUpdated=${effectUpdated}]`
		);
		return !!updated;
	}

	async updateActiveEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "updateActiveEffectFromIdOnTokenArr | inAttributes must be of type array");
		}
		const [effectId, uuid, origin, overlay, effectUpdated] = inAttributes;
		return this.updateActiveEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
	}

	async updateActiveEffectFromNameOnToken(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: ActiveEffect
	): Promise<boolean | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'updateActiveEffectFromNameOnToken' : [effectName=${effectName}, uuid=${uuid}, origin=${origin}, overlay=${overlay}, effectUpdated=${effectUpdated}]`
		);
		const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
		//@ts-ignore
		const actorEffects = <EmbeddedCollection<typeof ActiveEffect, Actor>>token.actor?.effects?.contents || [];
		const activeEffect = <
			ActiveEffect //@ts-ignore
		>actorEffects.find((activeEffect) => isStringEquals(<string>activeEffect?.label, effectName));

		if (!activeEffect) {
			return undefined;
		}

		if (String(overlay) === "false" || String(overlay) === "true") {
			// DO NOTHING
		} else {
			//@ts-ignore
			if (!activeEffect.flags) {
				//@ts-ignore
				activeEffect.flags = {};
			}
			//@ts-ignore
			if (!activeEffect.flags.core) {
				//@ts-ignore
				activeEffect.flags.core = {};
			}
			//@ts-ignore
			overlay = activeEffect.flags.core.overlay;
			if (!overlay) {
				overlay = false;
			}
		}

		if (!origin) {
			const sceneId = (token?.scene && token.scene.id) || canvas.scene?.id;
			origin = token.actor ? `Actor.${token.actor?.id}` : `Scene.${sceneId}.Token.${token.id}`;
		}
		const activeEffectDataUpdated = effectUpdated;
		//@ts-ignore
		const updated = await token.actor?.updateEmbeddedDocuments("ActiveEffect", [activeEffectDataUpdated]);
		//@ts-ignore
		logM(this.moduleName, `Updated effect ${activeEffect.label} to ${token.name} - ${token.id}`);
		debugM(
			this.moduleName,
			`END Effect Handler 'updateActiveEffectFromNameOnToken' : [effectName=${effectName}, uuid=${uuid}, origin=${origin}, overlay=${overlay}, effectUpdated=${effectUpdated}]`
		);
		return !!updated;
	}

	async updateActiveEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "updateActiveEffectFromNameOnTokenArr | inAttributes must be of type array");
		}
		const [effectName, uuid, origin, overlay, effectUpdated] = inAttributes;
		return this.updateEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
	}

	// ========================================================
	/**
	 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
	 * @param {MouseEvent} event      The left-click event on the effect control
	 * @param {Actor|Item} owner      The owning document which manages this effect
	 * @returns {Promise|null}        Promise that resolves when the changes are complete.
	 */
	async onManageActiveEffectFromEffectId(
		effectActions: EffectActions,
		owner: Actor | Item,
		effectId: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		isTemporary?: boolean | undefined,
		isDisabled?: boolean | undefined
	): Promise<Item | ActiveEffect | boolean | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'onManageActiveEffectFromEffectId' : [effectActions=${effectActions}, owner=${owner}, effectId=${effectId},
        alwaysDelete=${alwaysDelete}, forceEnabled=${forceEnabled}, forceDisabled=${forceDisabled}, isTemporary=${isTemporary},
        isDisabled=${isDisabled}]`
		);
		const actorEffects = owner?.effects;
		const activeEffect = <
			ActiveEffect //@ts-ignore
		>actorEffects.find((activeEffect) => <string>activeEffect?._id === effectId);
		const response = await this.onManageActiveEffectFromActiveEffect(
			effectActions,
			owner,
			activeEffect,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		debugM(
			this.moduleName,
			`END Effect Handler 'onManageActiveEffectFromEffectId' : [effectActions=${effectActions}, owner=${owner}, effectId=${effectId},
        alwaysDelete=${alwaysDelete}, forceEnabled=${forceEnabled}, forceDisabled=${forceDisabled}, isTemporary=${isTemporary},
        isDisabled=${isDisabled}]`
		);
		return response;
	}

	async onManageActiveEffectFromEffectIdArr(
		...inAttributes: any[]
	): Promise<Item | ActiveEffect | boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "onManageActiveEffectFromEffectIdArr | inAttributes must be of type array");
		}
		const [effectActions, owner, effectId, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled] =
			inAttributes;
		return this.onManageActiveEffectFromEffectId(
			effectActions,
			owner,
			effectId,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
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
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		isTemporary?: boolean | undefined,
		isDisabled?: boolean | undefined
	): Promise<Item | ActiveEffect | boolean | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'onManageActiveEffectFromEffect' : [effectActions=${effectActions}, owner=${owner}, effect=${effect},
        alwaysDelete=${alwaysDelete}, forceEnabled=${forceEnabled}, forceDisabled=${forceDisabled}, isTemporary=${isTemporary},
        isDisabled=${isDisabled}]`
		);
		const activeEffect = effect.name ? owner.effects.getName(i18n(effect.name)) : null;
		const response = await this.onManageActiveEffectFromActiveEffect(
			effectActions,
			owner,
			activeEffect,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
		debugM(
			this.moduleName,
			`END Effect Handler 'onManageActiveEffectFromEffect' : [effectActions=${effectActions}, owner=${owner}, effect=${effect},
        alwaysDelete=${alwaysDelete}, forceEnabled=${forceEnabled}, forceDisabled=${forceDisabled}, isTemporary=${isTemporary},
        isDisabled=${isDisabled}]`
		);
		return response;
	}

	async onManageActiveEffectFromEffectArr(
		...inAttributes: any[]
	): Promise<Item | ActiveEffect | boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(this.moduleName, "onManageActiveEffectFromEffectArr | inAttributes must be of type array");
		}
		const [effectActions, owner, effect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled] =
			inAttributes;
		return this.onManageActiveEffectFromEffect(
			effectActions,
			owner,
			effect,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
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
		activeEffect: ActiveEffect | null | undefined | undefined,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		isTemporary?: boolean | undefined,
		isDisabled?: boolean | undefined
	): Promise<Item | ActiveEffect | boolean | undefined> {
		debugM(
			this.moduleName,
			`START Effect Handler 'onManageActiveEffectFromActiveEffect' : [effectActions=${effectActions}, owner=${owner}, activeEffect=${activeEffect},
        alwaysDelete=${alwaysDelete}, forceEnabled=${forceEnabled}, forceDisabled=${forceDisabled}, isTemporary=${isTemporary},
        isDisabled=${isDisabled}]`
		);
		switch (effectActions) {
			case "update": {
				if (!activeEffect) {
					warnM(this.moduleName, `Can't retrieve effect to update`);
					return undefined;
				}
				if (owner instanceof Actor) {
					const actor = owner;
					//@ts-ignore
					if (!(<ActiveEffect>activeEffect).origin) {
						const origin = `Actor.${actor?.id}`;
						setProperty(activeEffect, "origin", origin);
					}
					const activeEffectsUpdated = <ActiveEffect[]>(
						await actor?.updateEmbeddedDocuments("ActiveEffect", [<any>activeEffect])
					);
					return activeEffectsUpdated[0];
				} else if (owner instanceof Item) {
					const item = owner;
					const itemUpdated = <Item>await item.update({
						//@ts-ignore
						effects: [activeEffect],
					});
					return itemUpdated;
				}
				return undefined;
			}
			case "create": {
				if (!activeEffect) {
					warnM(this.moduleName, `Can't retrieve effect to create`);
					return undefined;
				}
				if (owner instanceof Actor) {
					const actor = owner;
					//@ts-ignore
					if (!(<ActiveEffect>activeEffect).origin) {
						const origin = `Actor.${actor?.id}`;
						setProperty(activeEffect, "origin", origin);
					}
					const activeEffectsAdded = <ActiveEffect[]>(
						await actor?.createEmbeddedDocuments("ActiveEffect", [<any>activeEffect])
					);
					return activeEffectsAdded[0];
				} else if (owner instanceof Item) {
					const item = owner;
					const itemUpdated = await item.update({
						//@ts-ignore
						effects: [activeEffect],
					});
					return itemUpdated;
				}
				return undefined;
			}
			// case 'create': {
			//   return owner.createEmbeddedDocuments('ActiveEffect', [
			//     {
			//       label: game.i18n.localize('DND5E.EffectNew'),
			//       icon: 'icons/svg/aura.svg',
			//       origin: owner.uuid,
			//       'duration.rounds': isTemporary ? 1 : undefined,
			//       disabled: isDisabled,
			//     },
			//   ]);
			// }
			case "edit": {
				if (!activeEffect) {
					warnM(this.moduleName, `Can't retrieve effect to edit`);
					return undefined;
				}
				activeEffect?.sheet?.render(true);
				return true;
			}
			case "delete": {
				if (!activeEffect) {
					warnM(this.moduleName, `Can't retrieve effect to delete`);
					return undefined;
				}
				const activeEffectDeleted = <ActiveEffect>await activeEffect?.delete();
				return activeEffectDeleted;
			}
			case "toggle": {
				if (!activeEffect) {
					warnM(this.moduleName, `Can't retrieve effect to toogle`);
				}
				if (activeEffect?.getFlag("core", "statusId") || String(alwaysDelete) === "true") {
					const deleted = await activeEffect?.delete();
					return !!deleted;
				}
				let updated;
				//@ts-ignore
				if (String(forceEnabled) === "true" && activeEffect?.disabled) {
					updated = await activeEffect?.update({
						disabled: false,
					});
					//@ts-ignore
				} else if (String(forceDisabled) === "true" && !activeEffect?.disabled) {
					updated = await activeEffect?.update({
						disabled: true,
					});
				} else {
					// otherwise toggle its disabled status
					updated = await activeEffect?.update({
						//@ts-ignore
						disabled: !activeEffect?.disabled,
					});
				}
				return updated;
				// return activeEffect?.update({disabled: !activeEffect.disabled});
			}
			default: {
				return undefined;
			}
		}
	}

	async onManageActiveEffectFromActiveEffectArr(
		...inAttributes: any[]
	): Promise<Item | ActiveEffect | boolean | undefined> {
		if (!Array.isArray(inAttributes)) {
			throw errorM(
				this.moduleName,
				"onManageActiveEffectFromActiveEffectArr | inAttributes must be of type array"
			);
		}
		const [effectActions, owner, activeEffect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled] =
			inAttributes;
		return await this.onManageActiveEffectFromActiveEffect(
			effectActions,
			owner,
			activeEffect,
			alwaysDelete,
			forceEnabled,
			forceDisabled,
			isTemporary,
			isDisabled
		);
	}
}
