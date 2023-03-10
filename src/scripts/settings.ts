import API from "./api";
import CONSTANTS from "./constants";
import { dialogWarning, i18n, warn } from "./lib/lib";

export const registerSettings = function (): void {
	// game.settings.registerMenu(CONSTANTS.MODULE_ID, 'resetAllSettings', {
	//   name: `${CONSTANTS.MODULE_ID}.setting.reset.name`,
	//   hint: `${CONSTANTS.MODULE_ID}.setting.reset.hint`,
	//   icon: 'fas fa-coins',
	//   type: ResetSettingsDialog,
	//   restricted: true,
	// });

	// =====================================================================

	game.settings.register(CONSTANTS.MODULE_ID, "enableDropEffectsOnActors", {
		name: `${CONSTANTS.MODULE_ID}.setting.enableDropEffectsOnActors.name`,
		hint: `${CONSTANTS.MODULE_ID}.setting.enableDropEffectsOnActors.hint`,
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_ID, "enableDropEffectsOnItems", {
		name: `${CONSTANTS.MODULE_ID}.setting.enableDropEffectsOnItems.name`,
		hint: `${CONSTANTS.MODULE_ID}.setting.enableDropEffectsOnItems.hint`,
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_ID, "statusEffectNames", {
		name: `${CONSTANTS.MODULE_ID}.setting.statusEffectNames.name`,
		hint: `${CONSTANTS.MODULE_ID}.setting.statusEffectNames.hint`,
		scope: "world",
		config: false,
		default: API._defaultStatusEffectNames,
		type: Array,
	});

	game.settings.register(CONSTANTS.MODULE_ID, "enableStatusEffectNames", {
		name: `${CONSTANTS.MODULE_ID}.setting.enableStatusEffectNames.name`,
		hint: `${CONSTANTS.MODULE_ID}.setting.enableStatusEffectNames.hint`,
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});

    game.settings.register(CONSTANTS.MODULE_ID, "statusEffectsSortOrder", {
		name: `${CONSTANTS.MODULE_ID}.setting.statusEffectsSortOrder.name`,
		hint: `${CONSTANTS.MODULE_ID}.setting.statusEffectsSortOrder.hint`,
        scope: 'world',
        config: true,
        default: `${CONSTANTS.MODULE_ID}.setting.statusEffectsSortOrder.options.none`,
        choices: <any>{
            "byOrderAdded": `${CONSTANTS.MODULE_ID}.setting.statusEffectsSortOrder.options.byOrderAdded`,
            "alphabetical": `${CONSTANTS.MODULE_ID}.setting.statusEffectsSortOrder.options.alphabetical`,
        },
        type: String,
        requiresReload: true,
    });

	game.settings.register(CONSTANTS.MODULE_ID, "showOnlyTemporaryStatusEffectNames", {
		name: `${CONSTANTS.MODULE_ID}.setting.showOnlyTemporaryStatusEffectNames.name`,
		hint: `${CONSTANTS.MODULE_ID}.setting.showOnlyTemporaryStatusEffectNames.hint`,
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_ID, "enableShyEffectIcons", {
		name: `${CONSTANTS.MODULE_ID}.setting.enableShyEffectIcons.name`,
		hint: `${CONSTANTS.MODULE_ID}.setting.enableShyEffectIcons.hint`,
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_ID, "permLevel", {
		name: `${CONSTANTS.MODULE_ID}.setting.permLevel.name`,
		hint: `${CONSTANTS.MODULE_ID}.setting.permLevel.hint`,
		scope: "world",
		config: true,
		default: "None",
		type: String,
		choices: <any>{
			NONE: "None",
			LIMITED: "Limited",
			OBSERVER: "Observer",
			OWNER: "Owner",
		},
	});

	game.settings.register(CONSTANTS.MODULE_ID, "enableQuickStatusEffect", {
		name: `${CONSTANTS.MODULE_ID}.setting.enableQuickStatusEffect.name`,
		hint: `${CONSTANTS.MODULE_ID}.setting.enableQuickStatusEffect.hint`,
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_ID, "customEffectsItemId", {
		name: "Custom Effects Item ID",
		scope: "world",
		config: false,
		default: "",
		type: String,
	});

	// ========================================================================

	game.settings.register(CONSTANTS.MODULE_ID, "debug", {
		name: `${CONSTANTS.MODULE_ID}.setting.debug.name`,
		hint: `${CONSTANTS.MODULE_ID}.setting.debug.hint`,
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
	});

};

class ResetSettingsDialog extends FormApplication<FormApplicationOptions, object, any> {
	constructor(...args) {
		//@ts-ignore
		super(...args);
		//@ts-ignore
		return new Dialog({
			title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.title`),
			content:
				'<p style="margin-bottom:1rem;">' +
				game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.content`) +
				"</p>",
			buttons: {
				confirm: {
					icon: '<i class="fas fa-check"></i>',
					label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.confirm`),
					callback: async () => {
						const worldSettings = game.settings.storage
							?.get("world")
							?.filter((setting) => setting.key.startsWith(`${CONSTANTS.MODULE_ID}.`));
						for (let setting of worldSettings) {
							console.log(`Reset setting '${setting.key}'`);
							await setting.delete();
						}
						//window.location.reload();
					}
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.cancel`)
				}
			},
			default: "cancel"
		});
	}

	async _updateObject(event: Event, formData?: object): Promise<any> {
		// do nothing
	}
}
