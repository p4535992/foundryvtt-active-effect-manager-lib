import CONSTANTS from './constants';
import API from './api';
import { debug } from './lib/lib';
import { setSocket } from '../active-effect-manager-lib';

export let activeEffectManagerSocket;

export function registerSocket() {
  debug('Registered activeEffectManagerSocket');
  if (activeEffectManagerSocket) {
    return activeEffectManagerSocket;
  }
  //@ts-ignore
  activeEffectManagerSocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);

  /**
   * Effects
   */

  // Basic

  // activeEffectManagerSocket.register('addActorDataChanges', (...args) => API._actorUpdater.addActorDataChanges(...args));
  // activeEffectManagerSocket.register('removeActorDataChanges', (...args) => API._actorUpdater.removeActorDataChanges(...args));
  activeEffectManagerSocket.register('toggleEffect', (...args) => API.toggleEffectArr(...args));
  activeEffectManagerSocket.register('hasEffectApplied', (...args) => API.hasEffectAppliedArr(...args));
  activeEffectManagerSocket.register('addEffect', (...args) => API.addEffectArr(...args));
  activeEffectManagerSocket.register('removeEffect', (...args) => API.removeEffectArr(...args));

  // Actor

  activeEffectManagerSocket.register('toggleEffectFromIdOnActor', (...args) =>
    API.toggleEffectFromIdOnActorArr(...args),
  );
  activeEffectManagerSocket.register('hasEffectAppliedOnActor', (...args) => API.hasEffectAppliedOnActorArr(...args));
  activeEffectManagerSocket.register('hasEffectAppliedFromIdOnActor', (...args) =>
    API.hasEffectAppliedFromIdOnActorArr(...args),
  );
  activeEffectManagerSocket.register('addEffectOnActor', (...args) => API.addEffectOnActorArr(...args));
  activeEffectManagerSocket.register('removeEffectOnActor', (...args) => API.removeEffectOnActorArr(...args));
  activeEffectManagerSocket.register('removeEffectFromIdOnActor', (...args) =>
    API.removeEffectFromIdOnActorArr(...args),
  );
  activeEffectManagerSocket.register('findEffectByNameOnActor', (...args) => API.findEffectByNameOnActorArr(...args));

  // Token

  activeEffectManagerSocket.register('toggleEffectFromIdOnToken', (...args) =>
    API.toggleEffectFromIdOnTokenArr(...args),
  );
  activeEffectManagerSocket.register('toggleEffectFromDataOnToken', (...args) =>
    API.toggleEffectFromDataOnTokenArr(...args),
  );

  activeEffectManagerSocket.register('hasEffectAppliedFromIdOnToken', (...args) =>
    API.hasEffectAppliedFromIdOnTokenArr(...args),
  );
  activeEffectManagerSocket.register('hasEffectAppliedOnToken', (...args) => API.hasEffectAppliedOnTokenArr(...args));
  activeEffectManagerSocket.register('addEffectOnToken', (...args) => API.addEffectOnTokenArr(...args));
  activeEffectManagerSocket.register('removeEffectOnToken', (...args) => API.removeEffectOnTokenArr(...args));
  activeEffectManagerSocket.register('removeEffectFromIdOnToken', (...args) =>
    API.removeEffectFromIdOnTokenArr(...args),
  );
  activeEffectManagerSocket.register('removeEffectFromIdOnTokenMultiple', (...args) =>
    API.removeEffectFromIdOnTokenMultipleArr(...args),
  );
  activeEffectManagerSocket.register('findEffectByNameOnToken', (...args) => API.findEffectByNameOnTokenArr(...args));
  activeEffectManagerSocket.register('updateEffectFromIdOnToken', (...args) =>
    API.updateEffectFromIdOnTokenArr(...args),
  );
  activeEffectManagerSocket.register('updateEffectFromNameOnToken', (...args) =>
    API.updateEffectFromNameOnTokenArr(...args),
  );
  activeEffectManagerSocket.register('updateActiveEffectFromIdOnToken', (...args) =>
    API.updateActiveEffectFromIdOnTokenArr(...args),
  );
  activeEffectManagerSocket.register('updateActiveEffectFromNameOnToken', (...args) =>
    API.updateActiveEffectFromNameOnTokenArr(...args),
  );

  // ON MANAGE

  activeEffectManagerSocket.register('updateActiveEffectFromNameOnToken', (...args) =>
    API.updateActiveEffectFromNameOnTokenArr(...args),
  );
  activeEffectManagerSocket.register('onManageActiveEffectFromEffectId', (...args) =>
    API.onManageActiveEffectFromEffectIdArr(...args),
  );
  activeEffectManagerSocket.register('onManageActiveEffectFromEffect', (...args) =>
    API.onManageActiveEffectFromEffectArr(...args),
  );
  activeEffectManagerSocket.register('onManageActiveEffectFromActiveEffect', (...args) =>
    API.onManageActiveEffectFromActiveEffectArr(...args),
  );

  setSocket(activeEffectManagerSocket);
  return activeEffectManagerSocket;
}

async function callHook(inHookName, ...args) {
  const newArgs: any[] = [];
  for (let arg of args) {
    if (typeof arg === 'string') {
      const testArg = await fromUuid(arg);
      if (testArg) {
        arg = testArg;
      }
    }
    newArgs.push(arg);
  }
  return Hooks.callAll(inHookName, ...newArgs);
}
