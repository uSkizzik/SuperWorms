import { Actor } from "./Actor"
import { PlayerState } from "../schema/GameRoomState"
import { GameRoom } from "../rooms/GameRoom"

import { Player } from "../../../client/src/actors/Player"
import { normalMagnetRadius } from "../util"

/**
 * Shared player logic that runs on both client and server
 */
export class PlayerController extends Actor {
	sessionId: string
	state: PlayerState
	room: GameRoom
	actor?: Player

	constructor(sessionId: string, state: PlayerState, room: GameRoom, actor?: Player) {
		super()

		this.sessionId = sessionId
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
			this.calculateMovement()

			let nearestOrb = this.room.orbSpawner.findNearest(
				{
					x: this.state.x,
					y: this.state.y
				},
				normalMagnetRadius
			)

			if (nearestOrb) {
				this.room.orbSpawner.removeOrb(nearestOrb)
				this.state.score += nearestOrb.score
			}
		}
	}

	/**
	 * Client and Server
	 * Calculates angle of movement of a player and sets the variables accordingly depending on the side it's ran
	 * @param ptr World X and Y coords of the player's pointer
	 */
	calculateAngle(ptr: { x: number; y: number }) {
		let { x: ptrX = 0, y: ptrY = 0 } = ptr ?? {}

		let x = this.actor?.headPos?.x ?? this.state.x
		let y = this.actor?.headPos?.y ?? this.state.y

		let angle = this.actor?.angle ?? this.state.angle

		let dx = ptrX - x
		let dy = ptrY - y

		if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
			angle = Math.atan2(dy, dx)
		}

		if (!this.actor) {
			this.state.angle = angle
		} else {
			this.actor.angle = angle
		}
	}

	/**
	 * Client and Server
	 * Calculates movement of the player and sets the variables accordingly depending on the side it's ran
	 */
	calculateMovement() {
		let { angle, speed } = this.actor ?? this.state

		let x = this.actor?.headPos?.x ?? this.state.x
		let y = this.actor?.headPos?.y ?? this.state.y

		let newX = x + (speed / 100) * Math.cos(angle)
		let newY = y + (speed / 100) * Math.sin(angle)

		if (!this.actor) {
			this.state.x = newX
			this.state.y = newY
		} else {
			this.actor.headPos.x = newX
			this.actor.headPos.y = newY
		}
	}
}
