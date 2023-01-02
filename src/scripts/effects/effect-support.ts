import type { EffectChangeData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";
import type { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { i18n } from "../lib/lib";
import Effect, { Constants } from "../effects-public/effect";
import { isStringEquals, is_real_number } from "./effect-utility";

export class EffectSupport {
	static buildDefault(
		// effectData: Effect,
		id: string,
		name: string,
		icon: string,
		isPassive: boolean,
		changes: EffectChangeData[] = [],
		atlChanges: EffectChangeData[] = [],
		tokenMagicChanges: EffectChangeData[] = [],
		atcvChanges: EffectChangeData[] = []
	): Effect {
		return new Effect({
			customId: id,
			name: i18n(name),
			description: ``,
			icon: icon,
			tint: undefined,
			seconds: 0,
			rounds: 0,
			turns: 0,
			flags: foundry.utils.mergeObject(
				{},
				{
					core: {
						statusId: isPassive ? undefined : id,
						overlay: false,
					},
					isConvenient: true,
					isCustomConvenient: true,
					convenientDescription: "Applies custom effects",
				}
			),
			changes: changes,
			atlChanges: atlChanges,
			tokenMagicChanges: tokenMagicChanges,
			atcvChanges: atcvChanges,
			isDisabled: false,
			isTemporary: !isPassive,
			isSuppressed: false,
		});
	}

	static isDuplicateEffectChange(aeKey: string, arrChanges: EffectChangeData[]) {
		let isDuplicate = false;
		for (const aec of arrChanges) {
			if (isStringEquals(aec.key, aeKey)) {
				isDuplicate = true;
				break;
			}
		}
		return isDuplicate;
	}

	static _handleIntegrations(effect: Effect): EffectChangeData[] {
		const arrChanges: EffectChangeData[] = [];

		if (effect?.changes && effect?.changes.length > 0) {
			for (const change of effect?.changes) {
				if (!change.value) {
					change.value = "";
				}
				arrChanges.push(change);
			}
		}

		if (effect.atlChanges && effect.atlChanges.length > 0) {
			for (const atlChange of effect.atlChanges) {
				if (arrChanges.filter((e) => e.key === atlChange.key).length <= 0) {
					if (!EffectSupport.isDuplicateEffectChange(atlChange.key, arrChanges)) {
						if (!atlChange.value) {
							atlChange.value = "";
						}
						arrChanges.push(atlChange);
					}
				}
			}
		}

		if (effect.tokenMagicChanges && effect.tokenMagicChanges.length > 0) {
			for (const tokenMagicChange of effect.tokenMagicChanges) {
				if (arrChanges.filter((e) => e.key === tokenMagicChange.key).length <= 0) {
					if (!EffectSupport.isDuplicateEffectChange(tokenMagicChange.key, arrChanges)) {
						if (!tokenMagicChange.value) {
							tokenMagicChange.value = "";
						}
						arrChanges.push(tokenMagicChange);
					}
				}
			}
		}

		if (effect.atcvChanges && effect.atcvChanges.length > 0) {
			for (const atcvChange of effect.atcvChanges) {
				if (arrChanges.filter((e) => e.key === atcvChange.key).length <= 0) {
					if (!EffectSupport.isDuplicateEffectChange(atcvChange.key, arrChanges)) {
						if (!atcvChange.value) {
							atcvChange.value = "";
						}
						arrChanges.push(atcvChange);
					}
				}
			}
		}
		/*
    if (effect.atlChanges.length > 0) {
      arrChanges.push(...effect.atlChanges);
    }

    if (effect.tokenMagicChanges.length > 0) {
      arrChanges.push(...effect.tokenMagicChanges);
    }

    if (effect.atcvChanges.length > 0) {
      arrChanges.push(...effect.atcvChanges);
    }
    */
		return arrChanges;
	}

	static _isEmptyObject(obj: any) {
		// because Object.keys(new Date()).length === 0;
		// we have to do some additional check
		if (obj === null || obj === undefined) {
			return true;
		}
		const result =
			obj && // null and undefined check
			Object.keys(obj).length === 0; // || Object.getPrototypeOf(obj) === Object.prototype);
		return result;
	}

	static _getDurationData(seconds: number, rounds: number, turns: number, isTemporary: boolean) {
		const isPassive = !isTemporary;
		if (game.combat) {
			if (isPassive) {
				return {
					startTime: game.time.worldTime,
					startRound: 0,
					startTurn: 0,
				};
			} else {
				return {
					startRound: game.combat.round,
					rounds: EffectSupport._getCombatRounds(seconds, rounds),
					turns: !is_real_number(turns) ? undefined : turns,
				};
			}
		} else {
			if (isPassive) {
				return {
					startTime: game.time.worldTime,
					startRound: 0,
					startTurn: 0,
				};
			} else {
				return {
					startTime: game.time.worldTime,
					seconds: EffectSupport._getSeconds(seconds, rounds),
				};
			}
		}
		/*
    if (game.combat) {
      return {
        startRound: game.combat.round,
        rounds: EffectSupport._getCombatRounds(seconds, rounds),
        turns: !is_real_number(turns) ? undefined : turns,
      };
    } else {
      return {
        startTime: game.time.worldTime,
        seconds: EffectSupport._getSeconds(seconds, rounds),
      };
    }
    */
	}

	static _getCombatRounds(seconds: number, rounds: number) {
		if (rounds) {
			return rounds;
		}

		if (seconds) {
			return seconds / Constants.SECONDS.IN_ONE_ROUND;
		}

		return undefined;
	}

	static _getSeconds(seconds: number, rounds: number) {
		if (seconds) {
			return seconds;
		}

		if (rounds) {
			return rounds * Constants.SECONDS.IN_ONE_ROUND;
		}

		return undefined;
	}

	static convertActiveEffectToEffect(activeEffect: ActiveEffect): Effect {
		//@ts-ignore
		const atlChanges = activeEffect.changes.filter((changes) => changes.key.startsWith("ATL"));
		//@ts-ignore
		const tokenMagicChanges = activeEffect.changes.filter((changes) => changes.key === "macro.tokenMagic");
		//@ts-ignore
		const atcvChanges = activeEffect.changes.filter((changes) => changes.key.startsWith("ATCV"));
		//@ts-ignore
		const changes = activeEffect.changes.filter(
			(change) =>
				!change.key.startsWith("ATL") && change.key !== "macro.tokenMagic" && !change.key.startsWith("ATCV")
		);
		//@ts-ignore
		const isDisabled = activeEffect.disabled || false;
		//@ts-ignore
		const isSuppressed = activeEffect.isSuppressed || false;
		const isTemporary = activeEffect.isTemporary || false;
		const isPassive = !isTemporary;
		//@ts-ignore
		const currentDae = EffectSupport._isEmptyObject(activeEffect.dae) ? activeEffect.flags.dae : activeEffect.dae;
		//@ts-ignore
		const overlay = activeEffect.overlay;
		//@ts-ignore
		const statusId = isPassive ? undefined : activeEffect._id;

		return new Effect({
			customId: <string>activeEffect.id,
			//@ts-ignore
			name: i18n(activeEffect.label),
			//@ts-ignore
			description: i18n(<string>activeEffect.flags.customEffectDescription),
			//@ts-ignore
			icon: <string>activeEffect.icon,
			//@ts-ignore
			tint: <string>activeEffect.tint,
			//@ts-ignore
			seconds: activeEffect.duration.seconds,
			//@ts-ignore
			rounds: activeEffect.duration.rounds,
			//@ts-ignore
			turns: !is_real_number(activeEffect.duration.turns) ? undefined : activeEffect.duration.turns,
			//@ts-ignore
			// flags: activeEffect.flags,
			flags: foundry.utils.mergeObject(
				{
					core: {
						statusId: isPassive ? undefined : statusId,
						overlay: overlay ? overlay : false,
					},
					isConvenient: true,
					isCustomConvenient: true,
					//@ts-ignore
					convenientDescription: i18n(activeEffect.flags.convenientDescription) ?? "Applies custom effects",
					dae: EffectSupport._isEmptyObject(currentDae)
						? isPassive
							? { stackable: false, specialDuration: [], transfer: true }
							: {}
						: currentDae,
				},
				//@ts-ignore
				activeEffect.flags
			),
			changes,
			atlChanges,
			tokenMagicChanges,
			atcvChanges,
			isDisabled,
			isTemporary,
			isSuppressed,
		});
	}

	static convertActiveEffectDataPropertiesToActiveEffect(
		p: PropertiesToSource<any>,
		isPassive: boolean
	): ActiveEffect {
		let isTemporary = false;
		//@ts-ignore
		const currentDae = EffectSupport._isEmptyObject(p.dae) ? p.flags.dae : p.dae;
		if (is_real_number(p.duration.seconds)) {
			isTemporary = true;
		}
		if (is_real_number(p.duration.rounds)) {
			isTemporary = true;
		}
		if (is_real_number(p.duration.turns)) {
			isTemporary = true;
		}
		isPassive = !isTemporary;
		//@ts-ignore
		return ActiveEffect.create({
			id: p._id,
			name: i18n(p.label),
			label: i18n(p.label),
			icon: p.icon,
			tint: p.tint,
			duration: EffectSupport._getDurationData(
				<number>p.duration.seconds,
				<number>p.duration.rounds,
				<number>p.duration.turns,
				!isPassive
			),
			flags: foundry.utils.mergeObject(p.flags, {
				core: {
					statusId: isPassive ? undefined : p._id,
					//@ts-ignore
					overlay: p.overlay ? p.overlay : false, // MOD 4535992
				},
				isConvenient: true,
				isCustomConvenient: true,
				//@ts-ignore
				convenientDescription: p.description ? i18n(p.description) : "Applies custom effects",
				dae: EffectSupport._isEmptyObject(currentDae)
					? { stackable: false, specialDuration: [], transfer: true }
					: currentDae,
			}),
			origin: origin ? origin : p.origin ? p.origin : "", // MOD 4535992
			transfer: p.transfer ?? false,
			//changes: p.changes, // MOD 4535992
			changes: p.changes,
		});
	}

	/**
	 * Converts the effect data to an active effect data object
	 *
	 * @param {object} params - the params to use for conversion
	 * @param {string} params.origin - the origin to add to the effect
	 * @param {boolean} params.overlay - whether the effect is an overlay or not
	 * @returns {object} The active effect data object for this effect
	 */
	public static convertToActiveEffectData(effect: Effect): Record<string, unknown> {
		if (is_real_number(effect.seconds)) {
			effect.isTemporary = true;
		}
		if (is_real_number(effect.rounds)) {
			effect.isTemporary = true;
		}
		if (is_real_number(effect.turns)) {
			effect.isTemporary = true;
		}
		const isPassive = !effect.isTemporary;
		const myid = effect.customId
			? effect.customId
			: effect._id
			? effect._id
			: effect.flags?.core?.statusId
			? effect.flags.core.statusId
			: undefined;
		const myoverlay = effect.overlay
			? effect.overlay
			: effect.flags?.core?.overlay
			? effect.flags.core.overlay
			: false;
		const currentDae = EffectSupport._isEmptyObject(effect.dae)
			? effect.flags?.dae
				? effect.flags?.dae
				: {}
			: effect.dae;
		const currentFlags = effect.flags ? effect.flags : {};
		return {
			id: myid,
			name: i18n(effect.name),
			label: i18n(effect.name),
			description: i18n(effect.description), // 4535992 this not make sense, but it doesn't hurt either
			icon: effect.icon,
			tint: effect.tint,
			duration: EffectSupport._getDurationData(effect.seconds, effect.rounds, effect.turns, effect.isTemporary),
			flags: foundry.utils.mergeObject(currentFlags, {
				core: {
					statusId: isPassive ? undefined : myid,
					overlay: myoverlay,
				},
				isConvenient: true,
				isCustomConvenient: true,
				convenientDescription: i18n(effect.description) ?? "Applies custom effects",
				dae: EffectSupport._isEmptyObject(currentDae)
					? isPassive
						? { stackable: false, specialDuration: [], transfer: true }
						: {}
					: currentDae,
			}),
			origin: effect.origin ? effect.origin : "None", // MOD 4535992
			transfer: isPassive ? false : effect.transfer,
			//changes: effect.changes, // MOD 4535992
			changes: EffectSupport._handleIntegrations(effect),
			// 4535992 these are not under data
			// isDisabled: effect.isDisabled ?? false,
			// isTemporary: effect.isTemporary ?? false,
			// isSuppressed: effect.isSuppressed ?? false,
		};
	}

	// static retrieveChangesOrderedByPriority(changesTmp: EffectChangeData[]) {
	//   // Organize non-disabled effects by their application priority
	//   const changes = <EffectChangeData[]>changesTmp.reduce((changes) => {
	//     return changes.map((c: EffectChangeData) => {
	//       const c2 = <EffectChangeData>duplicateExtended(c);
	//       // c2.effect = e;
	//       c2.priority = <number>c2.priority ?? c2.mode * 10;
	//       return c2;
	//     });
	//   }, []);
	//   changes.sort((a, b) => <number>a.priority - <number>b.priority);
	//   return changes;
	// }

	static retrieveChangesOrderedByPriorityFromAE(activeEffect: ActiveEffect) {
		// Organize non-disabled effects by their application priority
		const changes = <EffectChangeData[]>[activeEffect].reduce((changes, e: ActiveEffect) => {
			//@ts-ignore
			if (e.disabled) {
				return changes;
			}
			return changes.concat(
				//@ts-ignore
				(<EffectChangeData[]>e.changes).map((c: EffectChangeData) => {
					//@ts-ignore
					const c2 = <EffectChangeData>duplicateExtended(c);
					// c2.effect = e;
					c2.priority = <number>c2.priority ?? c2.mode * 10;
					return c2;
				})
			);
		}, []);
		changes.sort((a, b) => <number>a.priority - <number>b.priority);
		return changes;
	}

	static _createAtlEffectKey(key) {
		let result = key;
		//@ts-ignore
		const version = game.release.generation;

		if (version >= 9) {
			switch (key) {
				case "ATL.dimLight":
					result = "ATL.light.dim";
					break;
				case "ATL.brightLight":
					result = "ATL.light.bright";
					break;
				case "ATL.lightAnimation":
					result = "ATL.light.animation";
					break;
				case "ATL.lightColor":
					result = "ATL.light.color";
					break;
				case "ATL.lightAlpha":
					result = "ATL.light.alpha";
					break;
				case "ATL.lightAngle":
					result = "ATL.light.angle";
					break;
			}
		}
		if (version >= 10) {
			switch (key) {
				case "ATL.sightAngle":
					result = "ATL.sight.angle";
					break;
				case "ATL.vision":
					result = "ATL.sight.enabled";
					break;
			}
		}
		return result;
	}

	static convertToATLEffect(
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

		// vision = false,
		// id: string | null = null,
		// name: string | null = null,
		height: number | null = null,
		width: number | null = null,
		scale: number | null = null,
		alpha: number | null = null
	) {
		const atlChanges: any = [];
		if (alpha != null) {
			atlChanges.push({
				key: "ATL.alpha",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: alpha,
			});
		}
		if (height && height > 0) {
			atlChanges.push({
				key: "ATL.height",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: height,
			});
		}
		if (width && width > 0) {
			atlChanges.push({
				key: "ATL.width",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: width,
			});
		}
		if (scale && scale > 0) {
			atlChanges.push({
				key: "ATL.scale",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: scale,
			});
		}
		// THEY ARE REPPLACED WITH VISION MODE
		if (dimSight && dimSight > 0) {
			atlChanges.push({
				// key: "ATL.dimSight",
				key: "ATL.sight.range",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: dimSight,
			});
		}
		// THEY ARE REPPLACED WITH VISION MODE
		if (brightSight && brightSight > 0) {
			atlChanges.push({
				// key: "ATL.sight.bright",
				key: "ATL.sight.brightness",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: brightSight,
			});
		}
		if (sightVisionMode) {
			atlChanges.push({
				key: "ATL.sight.visionMode",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: sightVisionMode,
			});
		}
		if (dimLight && dimLight > 0) {
			atlChanges.push({
				key: "ATL.light.dim",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: dimLight,
			});
		}
		if (brightLight && brightLight > 0) {
			atlChanges.push({
				key: "ATL.light.bright",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: brightLight,
			});
		}
		if (lightAngle) {
			atlChanges.push({
				key: "ATL.light.angle",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: lightAngle,
			});
		}
		if (lightColor) {
			atlChanges.push({
				key: "ATL.light.color",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: lightColor,
			});
		}
		if (lightAlpha) {
			atlChanges.push({
				key: "ATL.light.alpha",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: lightAlpha,
			});
		}
		if (lightAnimationType && lightAnimationSpeed && lightAnimationIntensity && lightAnimationReverse) {
			atlChanges.push({
				key: "ATL.light.animation",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: `{"type": "${lightAnimationType}","speed": ${lightAnimationSpeed},"intensity": ${lightAnimationIntensity}, "reverse":${lightAnimationReverse}}`,
			});
		} else if (lightAnimationType && lightAnimationSpeed && lightAnimationIntensity) {
			atlChanges.push({
				key: "ATL.light.animation",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: `{"type": "${lightAnimationType}","speed": ${lightAnimationSpeed},"intensity": ${lightAnimationIntensity}}`,
			});
		}
		const effectNameI18 = i18n(<string>effectName);
		const isTemporary = true;
		const isPassive = !isTemporary;
		const currentDae = {};
		const overlay = false;
		const statusId = "Convenient Effect: " + effectNameI18;
		const description = "Convenient Effect: " + effectNameI18;

		const efffectAtlToApply = new Effect({
			// // customId: id || <string>token.actor?.id,
			// customId: undefined, //<string>token.actor?.id,
			// name: <string>effectName,
			// icon: <string>effectIcon,
			// description: ``,
			// // seconds: Constants.SECONDS.IN_EIGHT_HOURS,
			// transfer: true,
			// seconds: duration !== null ? <number>duration * 60 : undefined, // minutes to seconds
			// atlChanges: atlChanges,

			customId: undefined, //<string>token.actor?.id,
			name: <string>effectNameI18,
			description: description,
			icon: <string>effectIcon,
			tint: "",
			seconds: duration !== null ? <number>duration * 60 : undefined, // minutes to seconds
			rounds: NaN,
			turns: NaN,
			isDynamic: false,
			isViewable: true,
			isDisabled: false,
			isTemporary: isTemporary,
			isSuppressed: false,
			flags: foundry.utils.mergeObject(
				{},
				{
					core: {
						statusId: isPassive ? undefined : statusId,
						overlay: overlay ? overlay : false,
					},
					isConvenient: true,
					isCustomConvenient: true,
					convenientDescription: i18n(description) ?? "Applies custom effects",
					dae: EffectSupport._isEmptyObject(currentDae)
						? isPassive
							? { stackable: false, specialDuration: [], transfer: true }
							: {}
						: currentDae,
				}
			),
			changes: [],
			atlChanges: atlChanges,
			tokenMagicChanges: [],
			nestedEffects: [],
			transfer: true,
			atcvChanges: [],
			dae: {},
			overlay: false,
		});
		return efffectAtlToApply;
	}

	static prepareOriginForToken(tokenOrTokenId: Token | string): string {
		let token: Token | undefined = undefined;
		if (typeof tokenOrTokenId === "string" || tokenOrTokenId instanceof String) {
			const tokens = <Token[]>canvas.tokens?.placeables;
			token = <Token>tokens.find((token) => token.id === <string>tokenOrTokenId);
		} else if (tokenOrTokenId instanceof Token) {
			token = tokenOrTokenId;
		}
		if (token) {
			const sceneId = (token?.scene && token.scene.id) || canvas.scene?.id;
			const origin = token.actor
				? `Actor.${token.actor?.id}`
				: sceneId
				? `Scene.${sceneId}.Token.${token.id}`
				: `Token.${token.id}`;
			return origin;
		} else {
			return "None";
		}
	}

	static prepareOriginForActor(actorOrActorId: Actor | string): string {
		let actor: Actor | undefined = undefined;
		if (typeof actorOrActorId === "string" || actorOrActorId instanceof String) {
			actor = <Actor>game.actors?.get(<string>actorOrActorId);
		} else if (actorOrActorId instanceof Actor) {
			actor = actorOrActorId;
		}
		if (actor) {
			const origin = `Actor.${actor.id}`;
			return origin;
		} else {
			return "None";
		}
	}

	static prepareOriginForItem(itemOrItemId: Item): string {
		const item = <Item>itemOrItemId;
		if (item) {
			if (item.parent instanceof Actor) {
				const origin = `Actor.${item.parent.id}.Item.${item.id}`;
				return origin;
			}
			//@ts-ignore
			else if (item.parent instanceof Token) {
				//@ts-ignore
				const origin = `Token.${item.parent.id}.Item.${item.id}`;
				return origin;
			} else {
				const origin = `Item.${item.id}`;
				return origin;
			}
		} else {
			return "None";
		}
	}

	static prepareOriginFromEntity(entity: Token | ActiveEffect | Item | Actor | string): string {
		let origin = "None";
		if (!entity) {
			return origin;
		}
		if (typeof entity === "string" || entity instanceof String) {
			origin = EffectSupport.prepareOriginForToken(<string>entity);
			if (!origin || origin === "None") {
				origin = EffectSupport.prepareOriginForActor(<string>entity);
			}
		}
		if (entity instanceof Token) {
			const token = <Token>entity;
			const sceneId = (token?.scene && token.scene.id) || canvas.scene?.id;
			if (token.actor) {
				origin = `Actor.${token.actor?.id}`;
			}
			if (sceneId) {
				origin = `Scene.${sceneId}.Token.${token.id}`;
			}
			origin = `Token.${token.id}`;
		} else if (entity instanceof ActiveEffect) {
			const ae = <ActiveEffect>entity;
			if (ae.parent) {
				if (ae.parent instanceof Item) {
					if (ae.parent.parent) {
						if (ae.parent.parent instanceof Actor) {
							origin = `Actor.${ae.parent.parent.id}.Item.${ae.parent.id}`;
						}
						//@ts-ignore
						else if (ae.parent.parent instanceof Token) {
							//@ts-ignore
							origin = `Token.${ae.parent.parent.id}.Item.${ae.parent.id}`;
						} else {
							origin = `Item.${ae.parent.id}`;
						}
					} else {
						origin = `Item.${ae.parent.id}`;
					}
				} else if (ae.parent instanceof Token) {
					origin = `Token.${ae.parent.id}`;
				} else if (ae.parent instanceof Actor) {
					origin = `Actor.${ae.parent.id}`;
				}
			}
		} else if (entity instanceof Item) {
			const item = <Item>entity;
			if (item.parent instanceof Actor) {
				origin = `Actor.${item.parent.id}.Item.${item.id}`;
			}
			//@ts-ignore
			else if (item.parent instanceof Token) {
				//@ts-ignore
				origin = `Token.${item.parent.id}.Item.${item.id}`;
			} else {
				origin = `Item.${item.id}`;
			}
		} else if (entity instanceof Actor) {
			const actor = <Actor>entity;
			origin = `Actor.${actor.id}`;
		}
		//@ts-ignore
		else if (entity.parent) {
			//@ts-ignore
			const parent = entity.parent;
			return EffectSupport.prepareOriginFromEntity(parent);
		}
		return origin;
	}
}
