import API from '../api';
import CONSTANTS from '../constants';
import { EffectSupport } from './effect-support';

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
        const effect = game.dfreds._customEffectsHandler.getCustomEffects().find((effect) => effect.name === name);

        if (effect) {
          return effect;
        }
        //@ts-ignore
        return game.dfreds.effects.all.find((effect) => effect.name === name);
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
  async onToggleEffect({ token, wrapper, args }) {
    // const token = args[0]; //<Token>(<unknown>this);
    // const [eventArr] = args;
    // const event = eventArr[0];
    // const overlay = eventArr.length > 1 && eventArr[1]?.overlay;
    const [event] = args;
    const overlay = args.length > 1 && args[1]?.overlay;
    const statusEffectId = event.currentTarget.dataset?.statusId;
    if (statusEffectId) {
      // Integration with DFred
      // if (statusEffectId.startsWith('Convenient Effect: ')) {
      event.preventDefault();
      event.stopPropagation();
      // const effectName = statusEffectId.replace('Convenient Effect: ', '');
      // const overlay = args.length > 1 && args[1]?.overlay;
      // const tokenId = <string>token.actor?.uuid;+
      // if (statusEffectId.startsWith('Convenient Effect: ')) {
      const img = event.currentTarget;
      const effect =
        img.dataset.statusId && token.actor
          ? CONFIG.statusEffects.find((e) => e.id === img.dataset.statusId)
          : img.getAttribute('src');
      if (!effect) {
        let statusId = statusEffectId.replace('Convenient Effect:', '');
        statusId = statusId.replace(/\s/g, '');
        statusId = statusId.trim().toLowerCase();
        const effectName = statusId;
        const tokenId = token.id;
        const result = <ActiveEffect>await API.findEffectByNameOnToken(tokenId, effectName);
        if (result) {
          // const uuids = <string[]>[tokenId];
          const effectId = <string>result.id;
          // TODO add moduel settings for manage this

          const effect = EffectSupport.convertActiveEffectToEffect(result);
          effect.customId = effectId;
          effect.name = effectName;
          effect.overlay = overlay;
          API.toggleEffectFromDataOnToken(tokenId, effect, false);
        }
      } else {
        wrapper(...args);
      }
    } else {
      wrapper(...args);
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

    let effectsArray: ActiveEffect[] =
      <ActiveEffect[]>(<unknown>token.actor?.data.effects) || <ActiveEffect[]>(<unknown>token.data.effects);
    if (game.settings.get(CONSTANTS.MODULE_NAME, 'showOnlyTemporaryStatusEffectNames')) {
      effectsArray = effectsArray.filter((ae) => {
        return ae.isTemporary;
      });
    }

    // Prepare the list of effects from the configured defaults and any additional effects present on the Token
    const tokenEffects = <any>foundry.utils.deepClone(effectsArray) || [];
    if (token.data.overlayEffect) {
      //@ts-ignore
      tokenEffects.push(token.data.overlayEffect);
    }

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
          if (ae.data.icon.includes(src)) {
            srcExt = true;
            isDisabled = ae.data.disabled;
            break;
          }
        }

        // const isActive = !!status.id || effectsArray.includes(src);
        let isActive = !!status.id || srcExt;
        let isOverlay = !!status.overlay || token.data.overlayEffect === src;
        if (isOverlay && isDisabled) {
          isOverlay = false;
        }
        if (!isActive && !isDisabled) {
          isActive = true;
        }

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

    // const activeEffect = <ActiveEffect>newTokenEffects.find((ae) =>{
    //   return isStringEquals(<string>ae.id,e.id) ||  isStringEquals(<string>ae.data.label,e.label);
    // });

    return CONFIG.statusEffects.concat(<any>tokenEffects).reduce((obj, e: any) => {
      if (e.contents) {
        let activeEffects = <ActiveEffect[]>e.contents;
        if (game.settings.get(CONSTANTS.MODULE_NAME, 'showOnlyTemporaryStatusEffectNames')) {
          activeEffects = activeEffects.filter((ae) => {
            return ae.isTemporary;
          });
        }
        for (const activeEffect of activeEffects) {
          if (activeEffect) {
            let labelEffect = <string>activeEffect.data.label || '';
            labelEffect = labelEffect.replace('Convenient Effect:', '').trim();
            const iconEffect = <string>activeEffect.data.icon || '';

            const isDisabled = activeEffect.data.disabled;
            let isActive = !activeEffect.data.disabled;
            //@ts-ignore
            let isOverlay = activeEffect.data.flags?.core?.overlay ?? false;
            if (isOverlay && isDisabled) {
              isOverlay = false;
            }
            if (!isActive && !isDisabled) {
              isActive = true;
            }

            //@ts-ignore
            let statusId = activeEffect.data.flags?.core?.statusId ?? activeEffect.data.label;
            statusId = statusId.replace('Convenient Effect:', '');
            statusId = statusId.replace(/\s/g, '');
            statusId = statusId.trim().toLowerCase();

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
      } else if (e instanceof ActiveEffect) {
        const activeEffect = <ActiveEffect>e;
        let labelEffect = <string>activeEffect.data.label || '';
        labelEffect = labelEffect.replace('Convenient Effect:', '').trim();
        const iconEffect = <string>activeEffect.data.icon || '';

        const isDisabled = activeEffect.data.disabled;
        let isActive = !activeEffect.data.disabled;
        //@ts-ignore
        let isOverlay = activeEffect.data.flags?.core?.overlay ?? false;
        if (isOverlay && isDisabled) {
          isOverlay = false;
        }
        if (!isActive && !isDisabled) {
          isActive = true;
        }

        //@ts-ignore
        let statusId = activeEffect.data.flags?.core?.statusId ?? activeEffect.data.label;
        statusId = statusId.replace('Convenient Effect:', '');
        statusId = statusId.replace(/\s/g, '');
        statusId = statusId.trim().toLowerCase();

        obj[statusId] = {
          id: statusId ?? '',
          title: labelEffect ? game.i18n.localize(labelEffect) : null,
          src: iconEffect,
          isActive,
          isOverlay,
          cssClass: [isActive ? 'active' : null, isOverlay ? 'overlay' : null].filterJoin(' '),
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
          if (ae.data.icon.includes(src)) {
            srcExt = true;
            break;
          }
        }

        // const isActive = !!status.id || effectsArray.includes(src);
        const isActive = !!status.id || srcExt;
        const isOverlay = !!status.overlay || token.data.overlayEffect === src;

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
