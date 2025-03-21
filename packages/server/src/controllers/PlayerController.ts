import { getStateCallbacks } from "colyseus.js"
import { Client } from "@colyseus/core"

import { PlayerActor } from "@superworms/client/src/actors/PlayerActor"

import { Controller } from "./Controller"

import { GameRoom } from "../rooms/GameRoom"
import { PlayerState } from "../states/PlayerState"
import type { ZoneState } from "../states/ZoneState.ts"

import { EStatusEffect } from "../effects/EStatusEffect.ts"
import { StatusEffect } from "../effects/StatusEffect.ts"

import { mapRadius, maxMapRadius, normalPickupRadius, normalSpeed, playerBurnScore, sprintSpeed, statusEffects } from "../util"

/**
 * Shared player logic that runs on both client and server
 */
export class PlayerController extends Controller {
	readonly sessionId: string
	readonly client: Client | null

	readonly state: PlayerState
	readonly room: GameRoom

	readonly actor?: PlayerActor

	effectHandlers: StatusEffect[] = []

	// Radius of zones the player can see
	static readonly viewRadius = 6

	private lastZone?: ZoneState

	constructor(client: string | Client, state: PlayerState, room: GameRoom, actor?: PlayerActor) {
		super()

		this.sessionId = typeof client !== "string" ? client.sessionId : client
		this.client = typeof client !== "string" ? client : null

		this.state = state
		this.room = room
		this.actor = actor

		this.state.bodyParts.push(this.state.headPos)

		if (this.actor) {
			this.actor.controller = this

			const $ = getStateCallbacks(room)

			$(state).statusEffects.onAdd((effect) => this.statusEffectAdded(effect))
			$(state).statusEffects.onRemove((effect) => this.statusEffectRemoved(effect))
		}
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

			const { x: playerX, y: playerY } = this.state.headPos

			if (playerX > maxMapRadius || playerX < -maxMapRadius || playerY > maxMapRadius || playerY < -maxMapRadius) {
				console.error(`Player outside of map bounds with coords ${playerX} / ${playerY}!`)
				this.client?.leave(4004, "Player out of bounds!")
			}

			let currentZone = this.room.zoneManager.findZoneByCoords(playerX, playerY)!
			if (currentZone != this.lastZone) this.loadZones()

			this.lastZone = currentZone

			// Make sure we don't have a NONE status effect
			this.state.statusEffects.delete(EStatusEffect.NONE)

			// let nearestOrb = this.room.orbSpawner.findNearest(
			// 	{
			// 		x: playerX,
			// 		y: playerY
			// 	},
			// 	normalPickupRadius,
			// 	this.state.statusEffects.size >= 1
			// )
			//
			// if (nearestOrb) {
			// 	if (nearestOrb.statusEffect && this.state.statusEffects.size >= 1) return
			//
			// 	this.room.orbSpawner.removeOrb(nearestOrb)
			// 	this.serverUpdateLength(nearestOrb.score)
			//
			// 	if (nearestOrb.statusEffect && nearestOrb.statusEffect > 0) {
			// 		this.state.statusEffects.add(nearestOrb.statusEffect)
			// 		this.statusEffectAdded(nearestOrb.statusEffect)
			// 	}
			// }

			if (this.state.score <= 10) this.stopSprint()
			if (this.state.isSprinting) this.serverUpdateLength(playerBurnScore * -1)
		}
	}

	startSprint() {
		if (!this.isServer()) {
			this.room.send("startSprint")
			return
		}

		if (!this.state.isSprintEnabled) return

		this.state.isSprinting = true
		this.state.speed = sprintSpeed
	}

	stopSprint() {
		if (!this.isServer()) {
			this.room.send("stopSprint")
			return
		}

		if (!this.state.isSprintEnabled) return

		this.state.isSprinting = false
		this.state.speed = normalSpeed
	}

	statusEffectAdded(effect: EStatusEffect) {
		this.effectHandlers.push(new statusEffects[effect](this.room, this))
	}

	statusEffectRemoved(effect: EStatusEffect) {
		const handlerIndex = this.effectHandlers.findIndex((val) => val.effect === effect)
		const handler = this.effectHandlers.splice(handlerIndex, 1)[0]

		handler.destroy()
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
	 * Get an array of zone states within the player's viewDistance
	 * @param playerX
	 * @param playerY
	 */
	getVisibleZones(playerX: number, playerY: number): ZoneState[] {
		if (this.isServer()) {
			const currentZone = this.room.zoneManager.findZoneByCoords(playerX, playerY)
			if (currentZone === null) throw "Player outside of map bounds!"

			const nearbyZones: ZoneState[] = []

			for (let dx = -PlayerController.viewRadius; dx <= PlayerController.viewRadius; dx++) {
				for (let dy = -PlayerController.viewRadius; dy <= PlayerController.viewRadius; dy++) {
					const zone = this.room.zoneManager.findZone(currentZone!.x + dx, currentZone!.y + dy)
					if (zone !== null) nearbyZones.push(zone)
					else console.warn("Tried querying for a non-existent zone", currentZone!.x + dx + "/" + (currentZone!.y + dy))
				}
			}

			return nearbyZones
		} else return this.state.loadedZones.toArray()
	}

	loadZones() {
		if (this.isServer()) {
			const newZones = this.getVisibleZones(this.state.headPos.x, this.state.headPos.y)

			const zonesToLoad = newZones.filter((zone) => !this.state.loadedZones.toArray().includes(zone))
			const zonesToUnload = this.state.loadedZones.toArray().filter((zone) => !newZones.includes(zone))

			zonesToLoad.forEach((zone) => {
				this.state.loadedZones.add(zone)
				this.client!.view!.add(zone)
			})

			zonesToUnload.forEach((zone) => {
				this.state.loadedZones.delete(zone)
				this.client!.view!.remove(zone)
			})
		}
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
			let targetAngle = Math.atan2(dy, dx)

			// Lerp the angle to prevent sharp turns
			let turnSpeed = 0.1 // Adjust this between 0 and 1 for smoothness
			let angleDiff = targetAngle - angle

			// Ensure the angle difference is within -PI to PI for shortest rotation
			angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))

			angle += angleDiff * turnSpeed
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
