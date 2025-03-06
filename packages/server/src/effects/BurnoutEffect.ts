import { PlayerController } from "../controllers/PlayerController.ts"
import { GameRoom } from "../rooms/GameRoom.ts"

import { StatusEffect } from "./StatusEffect.ts"
import { EStatusEffect } from "./EStatusEffect.ts"

import { burnoutSpeed, normalSpeed } from "../util"

export class BurnoutEffect extends StatusEffect {
	constructor(room: GameRoom, controller: PlayerController) {
		super(room, controller, EStatusEffect.BURNOUT, 0xfa0, 15)
	}

	apply() {
		super.apply()

		if (this.isServer()) {
			this.controller.stopSprint()

			this.controller.state.isSprintEnabled = false
			this.controller.state.speed = burnoutSpeed
		}
	}

	remove() {
		if (this.isServer()) {
			this.controller.state.isSprintEnabled = true
			this.controller.state.speed = normalSpeed
		}

		super.remove()
	}
}
