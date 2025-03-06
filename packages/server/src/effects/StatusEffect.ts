import { PlayerController } from "../controllers/PlayerController.ts"
import { GameRoom } from "../rooms/GameRoom.ts"

import { Controller } from "../controllers/Controller.ts"
import { EStatusEffect } from "./EStatusEffect.ts"

export abstract class StatusEffect extends Controller {
	// Coresponding EStatusEffect field
	readonly effect: EStatusEffect

	// Color to use on the client-side during development
	readonly color: number

	// How long (in seconds) the effect lasts
	readonly duration: number

	// What's the chance for a power-up orb to spawn as this effect
	// abstract spawnChance: number

	protected room: GameRoom
	protected controller: PlayerController

	constructor(room: GameRoom, controller: PlayerController, effect: EStatusEffect, color: number, duration: number) {
		super()

		this.room = room
		this.controller = controller

		this.effect = effect
		this.color = color
		this.duration = duration

		this.apply()
	}

	/**
	 * Determines whether this function is ran on the server
	 */
	isServer() {
		return Boolean(this.room.clock)
	}

	apply() {
		if (this.isServer()) {
			this.room.clock?.setTimeout(() => this.remove(), this.duration * 1000)
		}
	}

	remove() {
		if (this.isServer()) {
			this.controller.state.statusEffects.delete(this.effect)
			this.controller.statusEffectRemoved(this.effect)
		}
	}
}
