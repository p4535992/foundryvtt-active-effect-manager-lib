import { registerSocket, activeEffectManagerSocket } from './socket';

import CONSTANTS from './constants';
import { debug, i18n, i18nFormat, warn } from './lib/lib';
import API from './api';
import EffectInterface from './effects/effect-interface';
import StatusEffects from './effects/status-effects';
import type StatusEffectsLib from './effects/status-effects';

export const initHooks = (): void => {
  // registerSettings();
  // registerLibwrappers();
  // new HandlebarHelpers().registerHelpers();

  Hooks.once('socketlib.ready', registerSocket);

  //@ts-ignore
  window.activeEffectManager = {
    API,
  };
};

export const setupHooks = (): void => {
  //@ts-ignore
  window.activeEffectManager.API.effectInterface = new EffectInterface(CONSTANTS.MODULE_NAME);
  //@ts-ignore
  window.activeEffectManager.API.effectInterface.initialize();

  //@ts-ignore
  window.activeEffectManager.API.statusEffects = new StatusEffects().init();

  //@ts-ignore
  setApi(window.activeEffectManager.API);

  //@ts-ignore
  libWrapper.register(
    CONSTANTS.MODULE_NAME,
    'TokenHUD.prototype._onToggleEffect',
    function (wrapper, ...args) {
      const token = this.object;
      (<StatusEffectsLib><unknown>API.statusEffects).onToggleEffect(
        token,
        wrapper,
        args,
      );
    }
  );

  //@ts-ignore
  libWrapper.register(
    CONSTANTS.MODULE_NAME,
    'TokenHUD.prototype._getStatusEffectChoices',
    function (wrapper, ...args) {
      const token = this.object;
      return (<StatusEffectsLib><unknown>API.statusEffects).getStatusEffectChoices(
        token,
        wrapper,
        args,
      );
    }
  );

  //@ts-ignore
  libWrapper.register(
    CONSTANTS.MODULE_NAME,
    'TokenHUD.prototype.refreshStatusIcons',
    function (wrapper, ...args) {
      const tokenHud = <any>this;
      (<StatusEffectsLib><unknown>API.statusEffects).refreshStatusIcons(tokenHud);
      wrapper(...args);
    },
    'WRAPPER'
  );
};

export const readyHooks = (): void => {
  // checkSystem();
  // registerHotkeys();
  // Hooks.callAll(HOOKS.READY);


};
