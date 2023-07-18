export enum EffectActions {
	create = "create",
	edit = "edit",
	delete = "delete",
	toggle = "toggle",
	update = "update"
}

export interface StatusEffectInternal {
	id: string;
	title: string;
	name: string;
	src: string;
	icon: string;
	isActive: boolean;
	isOverlay: boolean;
	cssClass?: string;
}

export enum EffectFlags {}
