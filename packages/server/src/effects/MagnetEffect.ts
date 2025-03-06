import { PlayerController } from "../controllers/PlayerController.ts"
import { GameRoom } from "../rooms/GameRoom.ts"

import { StatusEffect } from "./StatusEffect.ts"
import { EStatusEffect } from "./EStatusEffect.ts"

import { magnetPickupRadius, normalPickupRadius } from "../util"

export class MagnetEffect extends StatusEffect {
	constructor(room: GameRoom, controller: PlayerController) {
		super(room, controller, EStatusEffect.MAGNET, 0xfff, 10)
	}

	apply() {
		super.apply()
		this.controller.state.pickupRadius = magnetPickupRadius
	}

	remove() {
		this.controller.state.pickupRadius = normalPickupRadius
		super.remove()
	}
}
