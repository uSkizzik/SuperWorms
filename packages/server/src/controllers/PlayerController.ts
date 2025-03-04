import { PlayerActor } from "@superworms/client/src/actors/PlayerActor"

import { Controller } from "./Controller"

import { GameRoom } from "../rooms/GameRoom"
import { PlayerState } from "../states/PlayerState"

import { normalMagnetRadius, normalSpeed, sprintSpeed } from "../util"

/**
 * Shared player logic that runs on both client and server
 */
export class PlayerController extends Controller {
	sessionId: string
	state: PlayerState
	room: GameRoom
	actor?: PlayerActor

	constructor(sessionId: string, state: PlayerState, room: GameRoom, actor?: PlayerActor) {
		super()

		this.sessionId = sessionId
		this.state = state
		this.room = room
		this.actor = actor

		this.state.bodyParts.push(this.state.headPos)

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
					x: this.state.headPos.x,
					y: this.state.headPos.y
				},
				normalMagnetRadius
			)

			if (nearestOrb) {
				this.room.orbSpawner.removeOrb(nearestOrb)
				this.serverUpdateLength(nearestOrb.score)
			}

			if (this.state.isSprinting) this.serverUpdateLength(-1)
			if (this.state.score <= 10) this.stopSprint()
		}
	}

	startSprint() {
		if (!this.isServer()) {
			this.room.send("startSprint")
			return
		}

		this.state.isSprinting = true
		this.state.speed = sprintSpeed
	}

	stopSprint() {
		if (!this.isServer()) {
			this.room.send("stopSprint")
			return
		}

		this.state.isSprinting = false
		this.state.speed = normalSpeed
	}

	/**
	 * Server-side Only
	 * @param diff The difference between the old and new value. Giving 5 would add 5, -5 would remove 5
	 */
	serverUpdateLength(diff: number) {
		if (this.isServer()) {
			let { score, bodyParts, tailPos } = this.state

			this.state.score = score + diff

			if (diff > 0) {
				for (let i = 0; i < diff; i++) {
					bodyParts.push(tailPos)
				}
			} else {
				bodyParts.splice(bodyParts.length - diff * -1, diff * -1)
			}
		} else throw "This method can run only on the server!"
	}

	/**
	 * Client and Server
	 * Calculates angle of movement of a player and sets the variables accordingly depending on the side it's ran
	 * @param ptr World X and Y coords of the player's pointer
	 */
	calculateAngle(ptr: { x: number; y: number }) {
		let { x: ptrX = 0, y: ptrY = 0 } = ptr
		let { angle, headPos } = this.actor ?? this.state

		let dx = ptrX - headPos.x
		let dy = ptrY - headPos.y

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
	 * Calculates movement of the player and sets the X and Y accordingly depending on the side it's ran
	 *
	 * **Tail position is updated only on the server-side, client-side player actors must manually update it**
	 */
	calculateMovement() {
		let { angle, headPos } = this.actor ?? this.state
		let { speed } = this.state

		let newX = headPos.x + (speed / 100) * Math.cos(angle)
		let newY = headPos.y + (speed / 100) * Math.sin(angle)

		if (!this.actor) {
			this.state.headPos.x = newX
			this.state.headPos.y = newY
		} else {
			this.actor.headPos.x = newX
			this.actor.headPos.y = newY
		}

		if (!this.actor) {
			let newTail = this.shiftPosition(this.state.bodyParts, headPos.x, headPos.y)

			this.state.tailPos.x = newTail.x
			this.state.tailPos.y = newTail.y
		}
	}

	private shiftPosition(array: { x: number; y: number }[], x: number, y: number) {
		if (array[0]) {
			array[0].x = x
			array[0].y = y
		}

		for (let i = 1; i < array.length; i++) {
			array[i].x = array[i - 1].x
			array[i].y = array[i - 1].y
		}

		return array[array.length - 1]
	}
}
