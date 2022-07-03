import type { StatusEffect } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/documents/token';
import type { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import API from '../api';
import CONSTANTS from '../constants';
import type Effect from './effect';
import type EffectInterface from './effect-interface';
import { isEmptyObject, isStringEquals } from './effect-log';

/**
 * Handles the status effects present on the token HUD
 */
export default class StatusEffectsLib {
  /**
   * Initialize the token status effects based on the user configured settings.
   */
  init(statusEffectNames: string[]) {
    this.initializeStatusEffects(statusEffectNames);
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
  initializeStatusEffects(statusEffectNames: string[]) {
    const modifyStatusEffects = 'add'; // TODO for now is always 'add'
    //@ts-ignore
    if (modifyStatusEffects === 'replace') {
      CONFIG.statusEffects = this._fetchStatusEffects(statusEffectNames);
    } else if (modifyStatusEffects === 'add') {
      CONFIG.statusEffects = CONFIG.statusEffects.concat(this._fetchStatusEffects(statusEffectNames));
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
        const effect = game.dfreds._customEffectsHandler.getCustomEffects().find((effect) => effect.name == name);

        if (effect) {
          return effect;
        }
        //@ts-ignore
        return game.dfreds.effects.all.find((effect) => effect.name == name);
      })
      .filter((effect) => effect)
      .map((effect) => effect.convertToActiveEffectData());
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
  async onToggleEffect(token: Token, wrapped, ...args) {
    // const token = args[0]; //<Token>(<unknown>this);
    const [eventArr] = args;
    const event = eventArr[0];
    const overlay = eventArr.length > 1 && eventArr[1]?.overlay;
    const statusEffectId = event.currentTarget.dataset.statusId;
    // Integration with DFred
    // if (statusEffectId.startsWith('Convenient Effect: ')) {
    event.preventDefault();
    event.stopPropagation();
    // const effectName = statusEffectId.replace('Convenient Effect: ', '');
    // const overlay = args.length > 1 && args[1]?.overlay;
    // const tokenId = <string>token.actor?.uuid;+
    const effectName = statusEffectId.replace('Convenient Effect:', '');
    const tokenId = token.id;
    const result = <ActiveEffect>await API.findEffectByNameOnToken(tokenId, effectName);
    if (result) {
      // const uuids = <string[]>[tokenId];
      const effectId = <string>result.id;
      API.toggleEffectFromIdOnToken(tokenId, effectId, true);
    } else {
      if (statusEffectId) {
        wrapped(...args);
      }
    }
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
    // const token = args[0]; //<Token>(<unknown>this);

    // NOTE: taken entirely from foundry.js, modified to remove the icon being the key
    // Get statuses which are active for the token actor
    const actor = token.actor || null;
    const statuses = actor
      ? actor.effects.reduce((obj, e) => {
          const id = e.getFlag('core', 'statusId');
          if (id) {
            obj[id] = {
              id: id,
              overlay: !!e.getFlag('core', 'overlay'),
            };
          }
          return obj;
        }, {})
      : {};

    const effectsArray: ActiveEffect[] =
      <ActiveEffect[]>(<unknown>token.actor?.data.effects) || <ActiveEffect[]>(<unknown>token.data.effects);

    // Prepare the list of effects from the configured defaults and any additional effects present on the Token
    const tokenEffects = <any>foundry.utils.deepClone(effectsArray) || [];
    if (token.data.overlayEffect) {
      //@ts-ignore
      tokenEffects.push(token.data.overlayEffect);
    }

    if (tokenEffects.size <= 0) {
      return CONFIG.statusEffects.reduce((obj, e: { icon: string; id: string; label: string }) => {
        const id = e.id; // NOTE: added this

        const src = <string>e.icon ?? e;
        // if (!obj && Array.isArray(obj) && id in obj) {
        //   return obj; // NOTE: changed from src to id
        // }
        if (id in obj) {
          return obj; // NOTE: changed from src to id
        }

        const status = statuses[e.id] || {};

        let srcExt = false;
        for (const ae of effectsArray) {
          //@ts-ignore
          if (ae.data.icon.includes(src)) {
            srcExt = true;
            break;
          }
        }

        // const isActive = !!status.id || effectsArray.includes(src);
        const isActive = !!status.id || srcExt;
        const isOverlay = !!status.overlay || token.data.overlayEffect === src;

        // if(!id || id === 'undefined' || id === 'null'){
        //   return obj;
        // }

        // NOTE: changed key from src to id
        obj[id] = {
          id: e.id ?? '',
          title: e.label ? game.i18n.localize(e.label) : null,
          src: src,
          isActive,
          isOverlay,
          cssClass: [isActive ? 'active' : null, isOverlay ? 'overlay' : null].filterJoin(' '),
        };
        return obj;
      }, {});
    }

    // const newTokenEffects = <ActiveEffect[]>[];
    // for (const tokenEffect of tokenEffects) {
    //   newTokenEffects.push(tokenEffect);
    // }

    return CONFIG.statusEffects.concat(<any>tokenEffects).reduce((obj, e: any) => {
      if (!e.id && e.contents) {
        // const activeEffect = <ActiveEffect>newTokenEffects.find((ae) =>{
        //   return isStringEquals(<string>ae.id,e.id) ||  isStringEquals(<string>ae.data.label,e.label);
        // });
        const activeEffects = <ActiveEffect[]>e.contents;
        for (const activeEffect of activeEffects) {
          if (activeEffect) {
            let labelEffect = <string>activeEffect.data.label || '';
            labelEffect = labelEffect.replace('Convenient Effect:', '').trim();
            const iconEffect = <string>activeEffect.data.icon || '';
            const isActive = !activeEffect.data.disabled;
            //@ts-ignore
            let statusId = activeEffect.data.flags.core.statusId ?? activeEffect.data.label;
            statusId = statusId.replace('Convenient Effect:', '').trim().toLowerCase();
            //@ts-ignore
            const isOverlay = activeEffect.data.flags.core.overlay;
            obj[statusId] = {
              id: statusId ?? '',
              title: labelEffect ? game.i18n.localize(labelEffect) : null,
              src: iconEffect,
              isActive,
              isOverlay,
              cssClass: [isActive ? 'active' : null, isOverlay ? 'overlay' : null].filterJoin(' '),
            };
          }
        }
      } else {
        const id = e.id; // NOTE: added this
        const src = <string>e.icon ?? e;
        // if (!obj && Array.isArray(obj) && id in obj) {
        //   return obj; // NOTE: changed from src to id
        // }
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
          if (ae.data.icon.includes(src)) {
            srcExt = true;
            break;
          }
        }

        // const isActive = !!status.id || effectsArray.includes(src);
        const isActive = !!status.id || srcExt;
        const isOverlay = !!status.overlay || token.data.overlayEffect === src;

        // if(!id || id === 'undefined' || id === 'null'){
        //   return obj;
        // }

        // NOTE: changed key from src to id
        obj[id] = {
          id: e.id ?? '',
          title: e.label ? game.i18n.localize(e.label) : null,
          src: src,
          isActive,
          isOverlay,
          cssClass: [isActive ? 'active' : null, isOverlay ? 'overlay' : null].filterJoin(' '),
        };
      }

      return obj;
    }, {});
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
    const effects = tokenHud.element.find('.status-effects')[0];
    const statuses = tokenHud._getStatusEffectChoices();
    for (const img of effects.children) {
      // NOTE: changed from img.getAttribute('src') to img.dataset.statusId
      const status = statuses[img.dataset.statusId] || {};
      img.classList.toggle('overlay', !!status.isOverlay);
      img.classList.toggle('active', !!status.isActive);
    }
  }
}
