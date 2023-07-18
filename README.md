![Latest Release Download Count](https://img.shields.io/github/downloads/p4535992/foundryvtt-active-effect-manager-lib/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge)

[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Factive-effect-manager-lib&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=active-effect-manager-lib)

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-active-effect-manager-lib%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge)

![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-active-effect-manager-lib%2Fmaster%2Fsrc%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Factive-effect-manager-lib%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/active-effect-manager-lib/)

![GitHub all releases](https://img.shields.io/github/downloads/p4535992/foundryvtt-active-effect-manager-lib/total?style=for-the-badge)

[![Translation status](https://weblate.foundryvtt-hub.com/widgets/active-effect-manager-lib/-/287x66-black.png)](https://weblate.foundryvtt-hub.com/engage/active-effect-manager-lib/)

### If you want to buy me a coffee [![alt-text](https://img.shields.io/badge/-Patreon-%23ff424d?style=for-the-badge)](https://www.patreon.com/p4535992)

# FoundryVTT Library: Active Effect Manager

A library for leverage and synchronize the creation/update/delete of Active Effects .

The library was born as a series of functions for integration with the "[DFreds Convenient Effects](https://github.com/DFreds/dfreds-convenient-effects)" module and utilities in a multi-system context outside Dnd5e.
After extensively testing it with different modules i decide to get better feedback from the community and in preparation for FVTT10 to separate it this part of the code from the projects to use it as a support library.

## Include as a dependency in your manifest

```json
{
    "id": "active-effect-manager-lib",
    "type": "module",
    "manifest": "https://github.com/p4535992/foundryvtt-active-effect-manager-lib/releases/latest/download/module.json"
}
```

## NOTE: If you are a javascript developer and not a typescript developer, you can just use the javascript files under the dist folder

### NOTE

In compliance with the licenses, some piece of code of some feature has been inserted by other projects that I describe in detail in the "Credits" department of this README, **I invite you to support these developers**.

My aim is not to take credit for their work, I just don't want to install 100 modules for 100 features which then collide with each other, every single external feature can be disabled in the settings of this module to allow the use of modules between them .

## Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/p4535992/foundryvtt-active-effect-manager-lib/master/src/module.json`
4.  Click 'Install' and wait for installation to complete
5.  Don't forget to enable the module in game using the "Manage Module" button

### libWrapper

This module uses the [libWrapper](https://github.com/ruipin/fvtt-lib-wrapper) library for wrapping core methods. It is a hard dependency and it is recommended for the best experience and compatibility with other modules.

### socketlib

This module uses the [socketlib](https://github.com/manuelVo/foundryvtt-socketlib) library for wrapping core methods. It is a hard dependency and it is recommended for the best experience and compatibility with other modules.

# Features

## Feature: Enable the extended status effect name hud interaction

_Custom integration for multysistem of [Adding and Removing Status Effects of Dfreds convinient effect](https://github.com/DFreds/dfreds-convenient-effects/wiki/User-Guide#adding-and-removing-status-effects) any credits for this feature is given to [DFreds](https://github.com/DFreds)_

This will extend the funcionality of the standard status effect name.

Once enabled, right click on any effect in the status effect panel application and select Toggle Status Effect to add or remove the effect from the list.

Conflict: You should not use this and Combat Utility Belt's "Enhanced Conditions" at the same time, as multiple modules replacing/adding to the available status effects can cause conflicts.

## Feature: Shy Effects

_Custom integration for multysistem of [Shy Effects](https://github.com/kandashi/shy-effect-icons) any credits for this feature is given to [Kandashi](https://github.com/kandashi)_

This module will disable any active effect icons that do not come from an "Owned source". This level of control can be configured from the module settings. A user requires X permissions on a source item/actor to view the active effects created by that item.

## Feature: Fathomless

_Custom integration for multysistem of [Fathomless - Proof of Concept](https://github.com/schultzcole/FVTT-Fathomless) any credits for this feature is given to [schultzcole](https://github.com/schultzcole/)_

This feature allow active effect changes to depend on actor data, even actor data that is modified by other active effects, so long as there are no cyclical dependencies.

This feature allows active effect changes to depend on other actor data, even actor data that is modified by other active effects. This is accomplished by constructing a directed graph that encapsulates the dependency relationships between actor properties, then using that graph to perform a Topological Sort in order to apply the effect changes in the correct order so that all dependencies are taken into account.

The nature of this implementation is such that any changes "downstream" of an actor property that is involved in a dependency cycle are ignored.

Referencing an actor property in an effect change is done with the syntax &my.actor.property.path. Note the use of & rather than @, which is deliberate (see the related caveat below).


## Feature: Drop Effects on Items

_Custom integration from [Drop Effects on Items](https://github.com/ElfFriend-DnD/foundryvtt-drop-effects-on-items)_

With it enabled, creating duplicate effects between different items (e.g. \"Poisoned\" for various weapons or spells which inflict that condition) is as simple as dragging and dropping from one to the next. It also allows the application of item effects onto actors from the item sheet directly.

## Feature: Drop Effects on Actors

_Custom integration from [DFreds Convenient Effects](https://github.com/DFreds/dfreds-convenient-effects)_

With it enabled, creating duplicate effects between different actors (e.g. \"Poisoned\" for various weapons or spells which inflict that condition) is as simple as dragging and dropping from one to the next.

## Feature: Quick status effect

_Custom integration from [Quick status effect](https://github.com/jeremiahverba/qss)_

Quickly select effects for a token or tokens by replacing the built-in status effect selector with an auto-complete-esque search box and filtered list.




# API (WORKING IN PROGRESS...)

## API Index

```
  addEffectOnActor(
    actorId: string,
    effectName: string,
    effect: Effect,
  ): Promise<Item | ActiveEffect | boolean | undefined>;

  findEffectByNameOnActor(
    actorId: string,
    effectName: string): Promise<ActiveEffect | undefined>;

  hasEffectAppliedOnActor(
    actorId: string,
    effectName: string,
    includeDisabled: boolean): Promise<boolean | undefined>;

  hasEffectAppliedFromIdOnActor(
    actorId: string,
    effectId: string,
    includeDisabled: boolean,
  ): Promise<boolean | undefined>;

  toggleEffectFromIdOnActor(
    actorId: string,
    effectId: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ): Promise<boolean | undefined>;

  addActiveEffectOnActor(
    actorId: string,
    activeEffect: ActiveEffect): Promise<ActiveEffect | undefined>;

  removeEffectOnActor(
    actorId: string,
    effectName: string): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnActor(
    actorId: string,
    effectId: string): Promise<ActiveEffect | undefined>;

  addEffectOnToken(
    tokenId: string,
    effectName: string,
    effect: Effect): Promise<ActiveEffect | undefined>;

  findEffectByNameOnToken(
    tokenId: string,
    effectName: string): Promise<ActiveEffect | undefined>;

  hasEffectAppliedOnToken(
    tokenId: string,
    effectName: string,
    includeDisabled: boolean): Promise<boolean | undefined>;

  hasEffectAppliedFromIdOnToken(
    tokenId: string,
    effectId: string,
    includeDisabled: boolean,
  ): Promise<boolean | undefined>;

  toggleEffectFromIdOnToken(
    tokenId: string,
    effectId: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ): Promise<boolean | undefined>;

  toggleEffectFromDataOnToken(
    tokenId: string,
    effect: Effect,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ): Promise<boolean | undefined>;

  addActiveEffectOnToken(
    tokenId: string,
    activeEffect: ActiveEffect): Promise<ActiveEffect | undefined>;

  removeEffectOnToken(
    tokenId: string,
    effectName: string): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnToken(
    tokenId: string,
    effectId: string): Promise<ActiveEffect | undefined>;

  removeEffectFromIdOnTokenMultiple(
    tokenId: string,
    effectIds: string[]): Promise<ActiveEffect | undefined>;

  updateEffectFromIdOnToken(
    tokenId: string,
    effectId: string,
    origin: string,
    overlay: boolean,
    effectUpdated: Effect,
  ): Promise<boolean | undefined>;

  updateEffectFromNameOnToken(
    tokenId: string,
    effectName: string,
    origin: string,
    overlay: boolean,
    effectUpdated: Effect,
  ): Promise<boolean | undefined>;

  updateActiveEffectFromIdOnToken(
    tokenId: string,
    effectId: string,
    origin: string,
    overlay: boolean,
    effectUpdated: ActiveEffect,
  ): Promise<boolean | undefined>;

  updateActiveEffectFromNameOnToken(
    tokenId: string,
    effectName: string,
    origin: string,
    overlay: boolean,
    effectUpdated: ActiveEffect,
  ): Promise<boolean | undefined>;

  onManageActiveEffectFromEffectId(
    effectActions: {
      create: 'create';
      edit: 'edit';
      delete: 'delete';
      toggle: ';
      update: 'update';
    } | string,
    owner: Actor | Item,
    effectId: string,
    alwaysDelete?: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    isTemporary?: boolean,
    isDisabled?: boolean,
  ): Promise<Item | ActiveEffect | boolean | undefined>;

  onManageActiveEffectFromEffect(
    effectActions: {
      create: 'create';
      edit: 'edit';
      delete: 'delete';
      toggle: 'toggle';
      update: 'update';
    } | string,
    owner: Actor | Item,
    effect: Effect,
    alwaysDelete?: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    isTemporary?: boolean,
    isDisabled?: boolean,
  ): Promise<Item | ActiveEffect | boolean | undefined>;

  onManageActiveEffectFromActiveEffect(
    effectActions: {
      create: 'create';
      edit: 'edit';
      delete: 'delete';
      toggle: 'toggle';
      update: 'update';
    } | string,
    owner: Actor | Item,
    activeEffect: ActiveEffect | null | undefined,
    alwaysDelete?: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    isTemporary?: boolean,
    isDisabled?: boolean,
  ): Promise<Item | ActiveEffect | boolean | undefined>;
```

###  async game.modules.get('active-effect-manager-lib').api.xxx() ⇒ <code>Promise.&lt;void&gt;</code>

Invoke the polymorpher manager feature from macro

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| sourceActorIdOrName | <code>string</code> | The id or the name of the actor (not the token) | <code>undefined</code> |
| removePolymorpher | <code>boolean</code> | This action should revert the polymorpher if the current token is polymorphed | <code>false</code> |
| ordered | <code>boolean</code> | The 'ordered' feature is enabled for this polymorphing | <code>false</code> |
| random | <code>boolean</code> | The 'random' feature is enabled for this polymorphing | <code>0</code> |
| animationExternal | <code>{ sequence:Sequence, timeToWait:number }</code> | Advanced: Use your personal sequence animation and the time needed to wait before the polymorph action, checkout the [Sequencer module](https://github.com/fantasycalendar/FoundryVTT-Sequencer) for more information  | <code>undefined</code> |

The effect object structer is the following:

```
{
    customId: string
    name: string
    description: string
    icon: string
    tint: string
    seconds: number
    rounds: number
    turns: number
    isDynamic: boolean
    isViewable: boolean
    isDisabled: boolean
    isTemporary: boolean
    isSuppressed: boolean
    flags = {},
    changes = ActiveEffectChangeData[],
    atlChanges = ActiveEffectChangeData[],
    tokenMagicChanges = ActiveEffectChangeData[],
    nestedEffects = Effect[],
    transfer: boolean
    atcvChanges = ActiveEffectChangeData[],
    dae = {},
    overlay: boolean
}
```

## [Changelog](./CHANGELOG.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/p4535992/environment-interactionenvironment-interaction-multisystem/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

- **[DFreds Convenient Effects](https://github.com/DFreds/dfreds-convenient-effects)**: [MIT](https://github.com/DFreds/dfreds-convenient-effects/blob/main/LICENSE)
- **[Shy Effects](https://github.com/kandashi/shy-effect-icons)**: [MIT](https://github.com/kandashi/shy-effect-icons/blob/master/LICENSE)
- **[Fathomless - Proof of Concept](https://github.com/schultzcole/FVTT-Fathomless)**: [GPLv3](https://github.com/schultzcole/FVTT-Fathomless/blob/master/LICENSE)
- **[Drop Effects on Items](https://github.com/ElfFriend-DnD/foundryvtt-drop-effects-on-items)**: [MIT](https://github.com/ElfFriend-DnD/foundryvtt-drop-effects-on-items/blob/main/LICENSE)
- **[Quick status effect](https://github.com/jeremiahverba/qss)**: [MIT](https://github.com/jeremiahverba/qss/blob/main/src/LICENSE)
- **[Apply Self Effects D&D5e](https://github.com/ElfFriend-DnD/foundryvtt-apply-self-effects)**: [MIT](https://github.com/ElfFriend-DnD/foundryvtt-apply-self-effects-5e/blob/main/LICENSE)

This package is under an [GPLv3](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Credits

- [kgart](https://github.com/kgar) for the svelte+ts template [Svelte + TS + Vite](https://github.com/kgar/svelte-in-foundry-example)
- [DFreds](https://github.com/DFreds) for the module [DFreds Convenient Effects](https://github.com/DFreds/dfreds-convenient-effects)
- [Kandashi](https://github.com/kandashi) for the module [Shy Effects](https://github.com/kandashi/shy-effect-icons)
- [schultzcole](https://github.com/schultzcole/) for the module [Fathomless - Proof of Concept](https://github.com/schultzcole/FVTT-Fathomless)
- [ElfFriend-DnD](https://github.com/ElfFriend-DnD)  for the module [Drop Effects on Items](https://github.com/ElfFriend-DnD/foundryvtt-drop-effects-on-items)
- [jeremiahverba](https://github.com/jeremiahverba) for the module [Quick status effect](https://github.com/jeremiahverba/qss)
- [ElfFriend-DnD](https://github.com/ElfFriend-DnD/) for the module [Apply Self Effects D&D5e](https://github.com/ElfFriend-DnD/foundryvtt-apply-self-effects)

## Acknowledgements

Bootstrapped with League of Extraordinary FoundryVTT Developers [foundry-vtt-types](https://github.com/League-of-Foundry-Developers/foundry-vtt-types).

