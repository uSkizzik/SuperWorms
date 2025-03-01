import { Actor } from "./Actor"
import { PlayerState } from "../schema/GameRoomState"
import { GameRoom } from "../rooms/GameRoom"

import { Player } from "../../../client/src/actors/Player"
import { normalMagnetRadius } from "../util"

/**
 * Shared player logic that runs on both client and server
 */
export class PlayerController extends Actor {
	state: PlayerState
	room: GameRoom
	actor?: Player

	constructor(state: PlayerState, room: GameRoom, actor?: Player) {
		super()

		this.state = state
		this.room = room
		this.actor = actor

		if (this.actor) this.actor.controller = this
	}

	/**
	 * Determines whether this function is ran on the server
	 */
	isServer() {
		return !this.actor
	}

	/**
	 * Runs every tick
	 */
	tick() {
		if (this.isServer()) {
			let nearestOrb = this.room.orbSpawner.findNearest(
				{
					x: this.state.x,
					y: this.state.y
				},
				normalMagnetRadius
			)

			if (nearestOrb) console.log(nearestOrb)
		}
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
