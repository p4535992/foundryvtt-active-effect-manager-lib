export enum EffectActions {
	create = "create",
	edit = "edit",
	delete = "delete",
	toggle = "toggle",
	update = "update",
}

export interface StatusEffectInternal {
	id: string;
	title: string;
	label: string;
	src: string;
	icon: string;
	isActive: boolean;
	isOverlay: boolean;
	cssClass?: string;
}
