import { PlayerController } from "../controllers/PlayerController.ts"
import { GameRoom } from "../rooms/GameRoom.ts"

import { StatusEffect } from "./StatusEffect.ts"
import { EStatusEffect } from "./EStatusEffect.ts"

export class KamikazeEffect extends StatusEffect {
	constructor(room: GameRoom, controller: PlayerController) {
		super(room, controller, EStatusEffect.KAMIKAZE, 0xf00, 15)
	}
}
