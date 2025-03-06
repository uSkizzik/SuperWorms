import { PlayerController } from "../controllers/PlayerController.ts"
import { GameRoom } from "../rooms/GameRoom.ts"

import { StatusEffect } from "./StatusEffect.ts"
import { EStatusEffect } from "./EStatusEffect.ts"

export class InvincibilityEffect extends StatusEffect {
	constructor(room: GameRoom, controller: PlayerController) {
		super(room, controller, EStatusEffect.INVINCIBILITY, 0x0dd, 15)
	}
}
