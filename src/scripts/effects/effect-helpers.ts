import { Constants } from "../effects-public/effect";

export function createActiveEffect({
	label,
	description = "",
	icon = "icons/svg/aura.svg",
	duration = {},
    tint = null,
	seconds = <number | null>null,
	rounds = null,
	turns = null,
	isDynamic = false,
	isViewable = true,
	flags = <any>{},
	origin = <string | null>null,
	changes = [],
	atlChanges = [],
	tokenMagicChanges = [],
	nestedEffects = [],
	subEffects = []
}) {
	// const settings = new Settings();

	// if (settings.integrateWithAte) {
	changes.push(...atlChanges);
	// }

	// if (settings.integrateWithTokenMagic) {
	changes.push(...tokenMagicChanges);
	// }

	if (!flags.core) {
		flags.core = {};
	}
	flags.core.statusId = `Convenient Effect: ${label}`;

	flags[Constants.MODULE_ID] = {};
	flags[Constants.MODULE_ID][Constants.FLAGS.DESCRIPTION] = description;
	flags[Constants.MODULE_ID][Constants.FLAGS.IS_CONVENIENT] = true;
	flags[Constants.MODULE_ID][Constants.FLAGS.IS_DYNAMIC] = isDynamic;
	flags[Constants.MODULE_ID][Constants.FLAGS.IS_VIEWABLE] = isViewable;
	flags[Constants.MODULE_ID][Constants.FLAGS.NESTED_EFFECTS] = nestedEffects;
	flags[Constants.MODULE_ID][Constants.FLAGS.SUB_EFFECTS] = subEffects;
	//@ts-ignore
	let effectDuration = isEmpty(duration)
		? {
				rounds,
				seconds,
				startRound: game.combat?.round,
				startTime: game.time.worldTime,
				startTurn: game.combat?.turn,
				turns
		  }
		: duration;
	let effect = new CONFIG.ActiveEffect.documentClass({
		changes,
		disabled: false,
		duration: effectDuration,
		flags,
		icon,
		label,
		origin,
        tint,
		transfer: false
	});

	return effect;
}

export function addOverlayAndOriginToEffect(effect, origin, overlay) {
	let newEffect = { ...effect };
	newEffect.flags.core.overlay = overlay;
	if (origin) {
		newEffect.origin = origin;
	}
	return newEffect;
}

/**
 * Gets the `isConvenient` flag on the active effect if it exists
 *
 * @param {ActiveEffect} activeEffect - the active effect
 * @returns {boolean} true if it is a convenient effect and false otherweise
 */
export function isConvenient(activeEffect) {
	const isConvenient = activeEffect.getFlag(Constants.MODULE_ID, Constants.FLAGS.IS_CONVENIENT) ?? false;

	const isOldConvenient = activeEffect.flags.isConvenient;
	const isOldCustomConvenient = activeEffect.flags.isCustomConvenient;

	return isConvenient || isOldConvenient || isOldCustomConvenient;
}

/**
 * Gets the description attached to the active effect
 *
 * @param {ActiveEffect} activeEffect - the active effect
 * @returns {string} The description for the effect
 */
export function getDescription(activeEffect) {
	const description = activeEffect.getFlag(Constants.MODULE_ID, Constants.FLAGS.DESCRIPTION);

	return description ?? activeEffect.flags.convenientDescription;
}
