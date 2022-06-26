import { registerSocket, activeEffectManagerSocket } from './socket';

import CONSTANTS from './constants';
import { debug, i18n, i18nFormat, warn } from './lib/lib';
import API from './api';
import EffectInterface from './effects/effect-interface';
import StatusEffects from './effects/status-effects';
import type StatusEffectsLib from './effects/status-effects';
import { setApi } from '../active-effect-manager-lib';

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
  window.activeEffectManager.API.statusEffects = new StatusEffects();
  //@ts-ignore
  window.activeEffectManager.API.statusEffects.init();

  //@ts-ignore
  setApi(window.activeEffectManager.API);

  //@ts-ignore
  libWrapper.register(CONSTANTS.MODULE_NAME, 'TokenHUD.prototype._onToggleEffect', function (wrapped, ...args) {
    const token = this.object;
    //@ts-ignore
    (<StatusEffectsLib>window.activeEffectManager.API.statusEffects).onToggleEffect(token, wrapped, args);
  });

  //@ts-ignore
  libWrapper.register(CONSTANTS.MODULE_NAME, 'TokenHUD.prototype._getStatusEffectChoices', function (wrapped, ...args) {
    const token = this.object;
    //@ts-ignore
    return (<StatusEffectsLib>window.activeEffectManager.API.statusEffects).getStatusEffectChoices(
      token,
      wrapped,
      args,
    );
  });

  //@ts-ignore
  libWrapper.register(
    CONSTANTS.MODULE_NAME,
    'TokenHUD.prototype.refreshStatusIcons',
    function (wrapped, ...args) {
      const tokenHud = <any>this;
      //@ts-ignore
      (<StatusEffectsLib>window.activeEffectManager.API.statusEffects).refreshStatusIcons(tokenHud);
      wrapped(...args);
    },
    'WRAPPER',
  );
};

export const readyHooks = (): void => {
  // checkSystem();
  // registerHotkeys();
  // Hooks.callAll(HOOKS.READY);
};
