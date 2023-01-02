import type Effect from "../effects-public/effect";
import type { EffectActions } from "./effect-models";

export interface EffectHandlerInterface {
	/**
	 * Toggles an effect on or off by name on an actor by UUID
	 *
	 * @param {string} effectName - name of the effect to toggle
	 * @param {boolean} overlay- if the effect is with overlay on the token
	 * @param {string[]} uuids - UUIDS of the actors to toggle the effect on
	 * @param {object} metadata - additional contextual data for the application of the effect (likely provided by midi-qol)
	 * @param {string} effectData - data of the effect to toggle (in this case is the add)
	 */
	toggleEffect(
		effectName: string,
		overlay: boolean,
		uuids: string[],
		metadata?: any,
		effectData?: Effect
	): Promise<boolean | undefined>;

	/**
	 * Toggles an effect on or off by name on an actor by UUID
	 *
	 * @param {string} effectName - name of the effect to toggle
	 * @param {object} params - the effect parameters
	 * @param {string} params.overlay - name of the effect to toggle
	 * @param {string[]} params.uuids - UUIDS of the actors to toggle the effect on
	 */
	toggleEffectArr(...inAttributes: any[]): Promise<boolean | undefined>;
	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is
	 * applied to
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectApplied(effectName: string, uuid: string): boolean;

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is
	 * applied to
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedArr(...inAttributes: any[]): boolean;

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	removeEffect(effectName: string, uuid: string): Promise<ActiveEffect | undefined>;

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	removeEffectArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

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
	addEffect(
		effectName: string | undefined | null,
		effectData: Effect,
		uuid: string,
		origin: string,
		overlay?: boolean,
		metadata?: any
	): Promise<ActiveEffect | undefined>;

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
	addEffectArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

	// _handleIntegrations(effect: Effect): EffectChangeData[];

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
	// _findEffectByName(effectName: string | undefined | null, actor: Actor): Effect | undefined;

	// convertToEffectClass(effect: ActiveEffect): Effect;

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
	findEffectByNameOnActor(effectName: string | undefined | null, uuid: string): Promise<ActiveEffect | undefined>;

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	findEffectByIdOnActor(effectId: string | undefined | null, uuid: string): Promise<ActiveEffect | undefined>;

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	findEffectByNameOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | null | undefined>;

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	findEffectByIdOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | null | undefined>;

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedOnActor(effectName: string, uuid: string, includeDisabled?: boolean): boolean;

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedOnActorArr(...inAttributes: any[]): boolean;
	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectId - the id of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedFromIdOnActor(effectId: string, uuid: string, includeDisabled?: boolean): boolean;

	/**
	 * Checks to see if any of the current active effects applied to the actor
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectId - the id of the effect to check
	 * @param {string} uuid - the uuid of the actor to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedFromIdOnActorArr(...inAttributes: any[]): boolean;

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	removeEffectOnActor(effectName: string, uuid: string): Promise<ActiveEffect | undefined>;

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	removeEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	removeEffectFromIdOnActor(effectId: string, uuid: string): Promise<ActiveEffect | undefined>;

	/**
	 * Removes the effect with the provided name from an actor matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the actor to remove the effect from
	 */
	removeEffectFromIdOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

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
	addEffectOnActor(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effect: Effect | null | undefined
	): Promise<ActiveEffect | undefined>;

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {string} effectName - the name of the effect to add
	 * @param {string} uuid - the uuid of the actor to add the effect to
	 */
	addEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

	/**
	 * @href https://github.com/ElfFriend-DnD/foundryvtt-temp-effects-as-statuses/blob/main/scripts/temp-effects-as-statuses.js
	 */
	toggleEffectFromIdOnActor(
		effectId: string,
		uuid: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		overlay?: boolean | undefined
	): Promise<boolean | undefined>;

	toggleEffectFromIdOnActorArr(...inAttributes: any[]): Promise<boolean | undefined>;

	/**
	 * Adds the effect with the provided name to an actor matching the provided
	 * UUID
	 *
	 * @param {string} uuid - the uuid of the actor to add the effect to
	 * @param {string} activeEffectData - the name of the effect to add
	 */
	addActiveEffectOnActor(uuid: string, activeEffectData: ActiveEffect): Promise<ActiveEffect | undefined>;

	addActiveEffectOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

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
	findEffectByNameOnToken(effectName: string, uuid: string): Promise<ActiveEffect | undefined>;

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectId - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	findEffectByIdOnToken(effectId: string, uuid: string): Promise<ActiveEffect | undefined>;

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	findEffectByNameOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

	/**
	 * Searches through the list of available effects and returns one matching the
	 * effect name. Prioritizes finding custom effects first.
	 *
	 * @param {string} effectName - the effect name to search for
	 * @returns {Effect} the found effect
	 */
	findEffectByIdOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

	/**
	 * Checks to see if any of the current active effects applied to the token
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the token to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedOnToken(effectName: string, uuid: string, includeDisabled?: boolean): boolean;

	/**
	 * Checks to see if any of the current active effects applied to the token
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectName - the name of the effect to check
	 * @param {string} uuid - the uuid of the token to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedOnTokenArr(...inAttributes: any[]): boolean;

	/**
	 * Checks to see if any of the current active effects applied to the token
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectId - the id of the effect to check
	 * @param {string} uuid - the uuid of the token to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedFromIdOnToken(effectId: string, uuid: string, includeDisabled?: boolean): boolean;

	/**
	 * Checks to see if any of the current active effects applied to the token
	 * with the given UUID match the effect name and are a convenient effect
	 *
	 * @param {string} effectId - the id of the effect to check
	 * @param {string} uuid - the uuid of the token to see if the effect is applied to
	 * @param {string} includeDisabled - if true include the applied disabled effect
	 * @returns {boolean} true if the effect is applied, false otherwise
	 */
	hasEffectAppliedFromIdOnTokenArr(...inAttributes: any[]): boolean;

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	removeEffectOnToken(effectName: string, uuid: string): Promise<ActiveEffect | undefined>;

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectName - the name of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	removeEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	removeEffectFromIdOnToken(effectId: string, uuid: string): Promise<ActiveEffect | undefined>;

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	removeEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	removeEffectFromIdOnTokenMultiple(effectIds: string[], uuid: string): Promise<ActiveEffect | undefined>;

	/**
	 * Removes the effect with the provided name from an token matching the
	 * provided UUID
	 *
	 * @param {string} effectId - the id of the effect to remove
	 * @param {string} uuid - the uuid of the token to remove the effect from
	 */
	removeEffectFromIdOnTokenMultipleArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

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
	addEffectOnToken(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effect: Effect | null | undefined
	): Promise<ActiveEffect | undefined>;

	/**
	 * Adds the effect with the provided name to an token matching the provided
	 * UUID
	 *
	 * @param {string} effectName - the name of the effect to add
	 * @param {string} uuid - the uuid of the token to add the effect to
	 */
	addEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

	/**
	 * @href https://github.com/ElfFriend-DnD/foundryvtt-temp-effects-as-statuses/blob/main/scripts/temp-effects-as-statuses.js
	 */
	toggleEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		overlay?: boolean | undefined
	): Promise<boolean | undefined>;

	/**
	 * @href https://github.com/ElfFriend-DnD/foundryvtt-temp-effects-as-statuses/blob/main/scripts/temp-effects-as-statuses.js
	 */
	toggleEffectFromDataOnToken(
		effect: Effect,
		uuid: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		overlay?: boolean | undefined
	): Promise<boolean | undefined>;

	toggleEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

	/**
	 * Adds the effect with the provided name to an token matching the provided
	 * UUID
	 *
	 * @param {string} uuid - the uuid of the token to add the effect to
	 * @param {string} activeEffectData - the name of the effect to add
	 */
	addActiveEffectOnToken(uuid: string, activeEffectData: ActiveEffect): Promise<ActiveEffect | undefined>;

	addActiveEffectOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | undefined>;

	updateEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: Effect
	): Promise<boolean | undefined>;

	updateEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

	updateEffectFromNameOnToken(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: Effect
	): Promise<boolean | undefined>;

	updateEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

	updateActiveEffectFromIdOnToken(
		effectId: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: ActiveEffect
	): Promise<boolean | undefined>;

	updateActiveEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;

	updateActiveEffectFromNameOnToken(
		effectName: string,
		uuid: string,
		origin: string,
		overlay: boolean,
		effectUpdated: ActiveEffect
	): Promise<boolean | undefined>;

	updateActiveEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined>;
	// ========================================================
	/**
	 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
	 * @param {MouseEvent} event      The left-click event on the effect control
	 * @param {Actor|Item} owner      The owning document which manages this effect
	 * @returns {Promise|null}        Promise that resolves when the changes are complete.
	 */
	onManageActiveEffectFromEffectId(
		effectActions: EffectActions | string,
		owner: Actor | Item,
		effectId: string,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		isTemporary?: boolean | undefined,
		isDisabled?: boolean | undefined
	): Promise<Item | ActiveEffect | boolean | undefined>;

	onManageActiveEffectFromEffectIdArr(...inAttributes: any[]): Promise<Item | ActiveEffect | boolean | undefined>;

	/**
	 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
	 * @param {MouseEvent} event      The left-click event on the effect control
	 * @param {Actor|Item} owner      The owning document which manages this effect
	 * @returns {Promise|null}        Promise that resolves when the changes are complete.
	 */
	onManageActiveEffectFromEffect(
		effectActions: EffectActions | string,
		owner: Actor | Item,
		effect: Effect,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		isTemporary?: boolean | undefined,
		isDisabled?: boolean | undefined
	): Promise<Item | ActiveEffect | boolean | undefined>;

	onManageActiveEffectFromEffectArr(...inAttributes: any[]): Promise<Item | ActiveEffect | boolean | undefined>;

	/**
	 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
	 * @param {MouseEvent} event      The left-click event on the effect control
	 * @param {Actor|Item} owner      The owning document which manages this effect
	 * @returns {Promise|null}        Promise that resolves when the changes are complete.
	 */
	onManageActiveEffectFromActiveEffect(
		effectActions: EffectActions | string,
		owner: Actor | Item,
		activeEffect: ActiveEffect | null | undefined | undefined,
		alwaysDelete?: boolean | undefined,
		forceEnabled?: boolean | undefined,
		forceDisabled?: boolean | undefined,
		isTemporary?: boolean | undefined,
		isDisabled?: boolean | undefined
	): Promise<Item | ActiveEffect | boolean | undefined>;

	onManageActiveEffectFromActiveEffectArr(...inAttributes: any[]): Promise<Item | ActiveEffect | boolean | undefined>;
}
