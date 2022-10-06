import { debugM, errorM, i18n, isStringEquals, logM, warnM } from "./effect-utility";
import FoundryHelpers from "./foundry-helpers";
import type Effect from "./effect";
import type EmbeddedCollection from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs";
import type {
	ActiveEffectData,
	ActorData,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { EffectSupport } from "./effect-support";
import type { EffectChangeData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";
import type { EffectActions } from "./effect-models";
import type { EffectHandlerInterface } from "./effect-handler-interface";
import EffectGenericHandler from "./effect-handler-generic";
import EffectPf2eHandler from "./effect-handler-pf2e";

export default class EffectHandler implements EffectHandlerInterface {
	moduleName: string;
	_foundryHelpers: FoundryHelpers;
    effectGenericHandler: EffectGenericHandler;
    effectPf2eHandler: EffectPf2eHandler;

    isPf2e: boolean;

	constructor(moduleName: string) {
		this.moduleName = moduleName;
		this._foundryHelpers = new FoundryHelpers();
        this.isPf2e = game.system.id === "pf2e";
        this.effectGenericHandler = new EffectGenericHandler(moduleName);
        this.effectPf2eHandler = new EffectPf2eHandler(moduleName);
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
		if(this.isPf2e){
            return await this.effectPf2eHandler.toggleEffect(effectName, overlay, uuids, metadata, effectData);
        } else {
            return await this.effectGenericHandler.toggleEffect(effectName, overlay, uuids, metadata, effectData);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.toggleEffectArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.toggleEffectArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return this.effectPf2eHandler.hasEffectApplied(effectName, uuid);
        } else {
            return this.effectGenericHandler.hasEffectApplied(effectName, uuid);
        }
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
        if(this.isPf2e){
            return this.effectPf2eHandler.hasEffectAppliedArr(...inAttributes);
        } else {
            return this.effectGenericHandler.hasEffectAppliedArr(...inAttributes);
        }
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffect(effectName: string, uuid: string): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffect(effectName, uuid);
        } else {
            return await this.effectGenericHandler.removeEffect(effectName, uuid);
        }
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.removeEffectArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.addEffect(effectName, effectData, uuid, origin, overlay, metadata);
        } else {
            return await this.effectGenericHandler.addEffect(effectName, effectData, uuid, origin, overlay, metadata);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.addEffectArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.addEffectArr(...inAttributes);
        }
	}

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
        if(this.isPf2e){
            return await this.effectPf2eHandler.findEffectByNameOnActor(effectName, uuid);
        } else {
            return await this.effectGenericHandler.findEffectByNameOnActor(effectName, uuid);
        }
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByIdOnActor(effectId: string | undefined | null, uuid: string): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.findEffectByIdOnActor(effectId, uuid);
        } else {
            return await this.effectGenericHandler.findEffectByIdOnActor(effectId, uuid);
        }
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByNameOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | null | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.findEffectByNameOnActorArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.findEffectByNameOnActorArr(...inAttributes);
        }
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByIdOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | null | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.findEffectByIdOnActorArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.findEffectByIdOnActorArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return this.effectPf2eHandler.hasEffectAppliedOnActor(effectName, uuid, includeDisabled);
        } else {
            return this.effectGenericHandler.hasEffectAppliedOnActor(effectName, uuid, includeDisabled);
        }
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
        if(this.isPf2e){
            return this.effectPf2eHandler.hasEffectAppliedOnActorArr(...inAttributes);
        } else {
            return this.effectGenericHandler.hasEffectAppliedOnActorArr(...inAttributes);
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
	hasEffectAppliedFromIdOnActor(effectId: string, uuid: string, includeDisabled = false): boolean {
        if(this.isPf2e){
            return this.effectPf2eHandler.hasEffectAppliedFromIdOnActor(effectId, uuid, includeDisabled);
        } else {
            return this.effectGenericHandler.hasEffectAppliedFromIdOnActor(effectId, uuid, includeDisabled);
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
	hasEffectAppliedFromIdOnActorArr(...inAttributes: any[]): boolean {
        if(this.isPf2e){
            return this.effectPf2eHandler.hasEffectAppliedFromIdOnActorArr(...inAttributes);
        } else {
            return this.effectGenericHandler.hasEffectAppliedFromIdOnActorArr(...inAttributes);
        }
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectOnActor(effectName: string, uuid: string): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectOnActor(effectName, uuid);
        } else {
            return await this.effectGenericHandler.removeEffectOnActor(effectName, uuid);
        }
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectOnActorArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.removeEffectOnActorArr(...inAttributes);
        }
	}

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	async removeEffectFromIdOnActor(effectId: string, uuid: string): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectFromIdOnActor(effectId, uuid);
        } else {
            return await this.effectGenericHandler.removeEffectFromIdOnActor(effectId, uuid);
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectFromIdOnActorArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.removeEffectFromIdOnActorArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.addEffectOnActor(effectName, uuid, origin, overlay, effect);
        } else {
            return await this.effectGenericHandler.addEffectOnActor(effectName, uuid, origin, overlay, effect);
        }
	}

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {string} effectName - the name of the effect to add
	 * @param {string} uuid - the uuid of the actor to add the effect to
	 */
	async addEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.addEffectOnActorArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.addEffectOnActorArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.toggleEffectFromIdOnActor(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        } else {
            return await this.effectGenericHandler.toggleEffectFromIdOnActor(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        }
	}

	async toggleEffectFromIdOnActorArr(...inAttributes: any[]): Promise<boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.toggleEffectFromIdOnActorArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.toggleEffectFromIdOnActorArr(...inAttributes);
        }
	}

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {string} uuid - the uuid of the actor to add the effect to
	 * @param {string} activeEffectData - the name of the effect to add
	 */
	async addActiveEffectOnActor(uuid: string, activeEffectData: ActiveEffect): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.addActiveEffectOnActor(uuid, activeEffectData);
        } else {
            return await this.effectGenericHandler.addActiveEffectOnActor(uuid, activeEffectData);
        }
	}

	async addActiveEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.addActiveEffectOnActorArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.addActiveEffectOnActorArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.findEffectByNameOnToken(effectName, uuid);
        } else {
            return await this.effectGenericHandler.findEffectByNameOnToken(effectName, uuid);
        }
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectId - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByIdOnToken(effectId: string, uuid: string): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.findEffectByIdOnToken(effectId, uuid);
        } else {
            return await this.effectGenericHandler.findEffectByIdOnToken(effectId, uuid);
        }
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByNameOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.findEffectByNameOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.findEffectByNameOnTokenArr(...inAttributes);
        }
	}

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	async findEffectByIdOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.findEffectByIdOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.findEffectByIdOnTokenArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return this.effectPf2eHandler.hasEffectAppliedOnToken(effectName, uuid, includeDisabled);
        } else {
            return this.effectGenericHandler.hasEffectAppliedOnToken(effectName, uuid, includeDisabled);
        }
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
        if(this.isPf2e){
            return this.effectPf2eHandler.hasEffectAppliedOnTokenArr(...inAttributes);
        } else {
            return this.effectGenericHandler.hasEffectAppliedOnTokenArr(...inAttributes);
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
	hasEffectAppliedFromIdOnToken(effectId: string, uuid: string, includeDisabled = false): boolean {
        if(this.isPf2e){
            return this.effectPf2eHandler.hasEffectAppliedFromIdOnToken(effectId, uuid, includeDisabled);
        } else {
            return this.effectGenericHandler.hasEffectAppliedFromIdOnToken(effectId, uuid, includeDisabled);
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
	hasEffectAppliedFromIdOnTokenArr(...inAttributes: any[]): boolean {
        if(this.isPf2e){
            return this.effectPf2eHandler.hasEffectAppliedFromIdOnTokenArr(...inAttributes);
        } else {
            return this.effectGenericHandler.hasEffectAppliedFromIdOnTokenArr(...inAttributes);
        }
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectOnToken(effectName: string, uuid: string): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectOnToken(effectName, uuid);
        } else {
            return await this.effectGenericHandler.removeEffectOnToken(effectName, uuid);
        }
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.removeEffectOnTokenArr(...inAttributes);
        }
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectFromIdOnToken(effectId: string, uuid: string): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectFromIdOnToken(effectId, uuid);
        } else {
            return await this.effectGenericHandler.removeEffectFromIdOnToken(effectId, uuid);
        }
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectFromIdOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.removeEffectFromIdOnTokenArr(...inAttributes);
        }
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectFromIdOnTokenMultiple(effectIds: string[], uuid: string): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectFromIdOnTokenMultiple(effectIds, uuid);
        } else {
            return await this.effectGenericHandler.removeEffectFromIdOnTokenMultiple(effectIds, uuid);
        }
	}

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	async removeEffectFromIdOnTokenMultipleArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.removeEffectFromIdOnTokenMultipleArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.removeEffectFromIdOnTokenMultipleArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.addEffectOnToken(effectName, uuid, origin, overlay, effect);
        } else {
            return await this.effectGenericHandler.addEffectOnToken(effectName, uuid, origin, overlay, effect);
        }
	}

	/**
	 * Adds the effect with the provided name to an token matching the provided
	 * UUID
	 *
	 * @param {string} effectName - the name of the effect to add
	 * @param {string} uuid - the uuid of the token to add the effect to
	 */
	async addEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.addEffectOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.addEffectOnTokenArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.toggleEffectFromIdOnToken(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        } else {
            return await this.effectGenericHandler.toggleEffectFromIdOnToken(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.toggleEffectFromDataOnToken(effect, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        } else {
            return await this.effectGenericHandler.toggleEffectFromDataOnToken(effect, uuid, alwaysDelete, forceEnabled, forceDisabled, overlay);
        }
	}

	async toggleEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.toggleEffectFromIdOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.toggleEffectFromIdOnTokenArr(...inAttributes);
        }
	}

	/**
	 * Adds the effect with the provided name to an token matching the provided
	 * UUID
	 *
	 * @param {string} uuid - the uuid of the token to add the effect to
	 * @param {string} activeEffectData - the name of the effect to add
	 */
	async addActiveEffectOnToken(uuid: string, activeEffectData: ActiveEffect): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.addActiveEffectOnToken(uuid, activeEffectData);
        } else {
            return await this.effectGenericHandler.addActiveEffectOnToken(uuid, activeEffectData);
        }
	}

	async addActiveEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.addActiveEffectOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.addActiveEffectOnTokenArr(...inAttributes);
        }
	}

	async updateEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: Effect
	): Promise<boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.updateEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
        } else {
            return await this.effectGenericHandler.updateEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
        }
	}

	async updateEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.updateEffectFromIdOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.updateEffectFromIdOnTokenArr(...inAttributes);
        }
	}

	async updateEffectFromNameOnToken(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: Effect
	): Promise<boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.updateEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
        } else {
            return await this.effectGenericHandler.updateEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
        }
	}

	async updateEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.updateEffectFromNameOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.updateEffectFromNameOnTokenArr(...inAttributes);
        }
	}

	async updateActiveEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: ActiveEffect
	): Promise<boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.updateActiveEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
        } else {
            return await this.effectGenericHandler.updateActiveEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
        }
	}

	async updateActiveEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.updateActiveEffectFromIdOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.updateActiveEffectFromIdOnTokenArr(...inAttributes);
        }
	}

	async updateActiveEffectFromNameOnToken(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: ActiveEffect
	): Promise<boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.updateActiveEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
        } else {
            return await this.effectGenericHandler.updateActiveEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
        }
	}

	async updateActiveEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.updateActiveEffectFromNameOnTokenArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.updateActiveEffectFromNameOnTokenArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler
                .onManageActiveEffectFromEffectId(effectActions, owner, effectId, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        } else {
            return await this.effectGenericHandler
                .onManageActiveEffectFromEffectId(effectActions, owner, effectId, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        }
	}

	async onManageActiveEffectFromEffectIdArr(...inAttributes: any[]): Promise<Item | ActiveEffect | boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.onManageActiveEffectFromEffectIdArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.onManageActiveEffectFromEffectIdArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler
                .onManageActiveEffectFromEffect(effectActions, owner, effect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        } else {
            return await this.effectGenericHandler
                .onManageActiveEffectFromEffect(effectActions, owner, effect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        }
	}

	async onManageActiveEffectFromEffectArr(...inAttributes: any[]): Promise<Item | ActiveEffect | boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.onManageActiveEffectFromEffectArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.onManageActiveEffectFromEffectArr(...inAttributes);
        }
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
        if(this.isPf2e){
            return await this.effectPf2eHandler.onManageActiveEffectFromActiveEffect(
                effectActions, owner, activeEffect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        } else {
            return await this.effectGenericHandler.onManageActiveEffectFromActiveEffect(
                effectActions, owner, activeEffect, alwaysDelete, forceEnabled, forceDisabled, isTemporary, isDisabled);
        }
	}

	async onManageActiveEffectFromActiveEffectArr(
		...inAttributes: any[]
	): Promise<Item | ActiveEffect | boolean | undefined> {
        if(this.isPf2e){
            return await this.effectPf2eHandler.onManageActiveEffectFromActiveEffectArr(...inAttributes);
        } else {
            return await this.effectGenericHandler.onManageActiveEffectFromActiveEffectArr(...inAttributes);
        }
	}
}
