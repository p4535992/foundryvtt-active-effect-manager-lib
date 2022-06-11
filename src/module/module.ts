import { registerSocket, activeEffectManagerSocket } from './socket';

import CONSTANTS from './constants';
import { debug, i18n, i18nFormat, warn } from './lib/lib';
import API from './api';
import EffectInterface from './effects/effect-interface';

export const initHooks = (): void => {
  // registerSettings();
  // registerLibwrappers();
  // new HandlebarHelpers().registerHelpers();

  Hooks.once('socketlib.ready', registerSocket);

  // Hooks.on('dfreds-convenient-effects.ready', (...args) => {
  //   if (game.user?.isGM) {
  //     module.dfredsConvenientEffectsReady(...args);
  //   }
  // });

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
  setApi(window.activeEffectManager.API);
};

export const readyHooks = (): void => {
  // checkSystem();
  // registerHotkeys();
  // Hooks.callAll(HOOKS.READY);
};
