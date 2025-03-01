import { Player } from "../../../client/src/actors/Player"
import { PlayerState } from "../schema/GameRoomState"

/**
 * Shared player logic that runs on both client and server
 */
export class PlayerController {
	state: PlayerState
	actor?: Player

	constructor(state: PlayerState, actor?: Player) {
		this.state = state
		this.actor = actor

		if (this.actor) this.actor.controller = this
	}

	/**
	 * Client and Server
	 * Calculates movement of the player and sets the variables accordingly depending on the side it's ran.
	 * @param ptr World X and Y coords of the player's pointer. If undefined, doesn't recalculate angle.
	 */
	calculateMovement(ptr?: { x: number; y: number }) {
		let { x: ptrX = 0, y: ptrY = 0 } = ptr ?? {}

		let x = this.actor?.headPos?.x ?? this.state.x
		let y = this.actor?.headPos?.y ?? this.state.y

		let angle = this.actor?.angle ?? this.state.angle
		let speed = this.actor?.speed ?? this.state.speed

		let dx = ptrX - x
		let dy = ptrY - y

		if ((ptr && Math.abs(dx) > 1) || Math.abs(dy) > 1) {
			angle = Math.atan2(dy, dx)
		}

		let newX = x + (speed / 100) * Math.cos(angle)
		let newY = y + (speed / 100) * Math.sin(angle)

		if (!this.actor) {
			this.state.x = newX
			this.state.y = newY
			this.state.angle = angle
		} else {
			this.actor.headPos.x = newX
			this.actor.headPos.y = newY
			this.actor.angle = angle
		}
	}
}
