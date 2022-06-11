![Latest Release Download Count](https://img.shields.io/github/downloads/p4535992/foundryvtt-active-effect-manager-lib/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) 

[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Factive-effect-manager-lib&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=active-effect-manager-lib) 

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Factive-effect-manager-lib%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge)

![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Factive-effect-manager-lib%2Fmaster%2Fsrc%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Factive-effect-manager-lib%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/active-effect-manager-lib/)

![GitHub all releases](https://img.shields.io/github/downloads/p4535992/foundryvtt-active-effect-manager-lib/total?style=for-the-badge)

### If you want to buy me a coffee [![alt-text](https://img.shields.io/badge/-Patreon-%23ff424d?style=for-the-badge)](https://www.patreon.com/p4535992)

# FoundryVTT Library: Active Effect Manager

XXX

## Include as a dependency in your manifest

```json
{
    "name": "active-effect-manager-lib",
    "type": "module",
    "manifest": "https://github.com/p4535992/foundryvtt-active-effect-manager-lib/releases/latest/download/module.json"
}
```

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

# API

###  async game.modules.get('active-effect-manager-lib').api.invokePolymorpherManagerFromActor(sourceActorIdOrName: string, removePolymorpher = false, ordered = false, random = false, animationExternal:{ sequence:Sequence, timeToWait:number }|undefined = undefined) ⇒ <code>Promise.&lt;void&gt;</code>

Invoke the polymorpher manager feature from macro

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| sourceActorIdOrName | <code>string</code> | The id or the name of the actor (not the token) | <code>undefined</code> |
| removePolymorpher | <code>boolean</code> | This action should revert the polymorpher if the current token is polymorphed | <code>false</code> |
| ordered | <code>boolean</code> | The 'ordered' feature is enabled for this polymorphing | <code>false</code> |
| random | <code>boolean</code> | The 'random' feature is enabled for this polymorphing | <code>0</code> |
| animationExternal | <code>{ sequence:Sequence, timeToWait:number }</code> | Advanced: Use your personal sequence animation and the time needed to wait before the polymorph action, checkout the [Sequencer module](https://github.com/fantasycalendar/FoundryVTT-Sequencer) for more information  | <code>undefined</code> |

**NOTE:** If both 'random' and 'ordered' are false the standard dialog will be rendered.

