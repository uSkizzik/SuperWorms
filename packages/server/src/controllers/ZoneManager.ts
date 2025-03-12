import { Client } from "@colyseus/core"

import { Controller } from "./Controller"

import { GameRoom } from "../rooms/GameRoom"

import { OrbState } from "../states/OrbState.ts"
import { ZoneState } from "../states/ZoneState.ts"

import { maxMapRadius, zoneSize } from "../util"

/**
 * Server-Side Zone Manager
 */
export class ZoneManager extends Controller {
	private readonly room: GameRoom
	private readonly zoneStates: ZoneState[] = []

	constructor(room: GameRoom) {
		super()
		this.room = room
	}

	serverInitZones() {
		for (let i = 0; i < maxMapRadius / zoneSize; i++) {
			for (let j = 0; j < maxMapRadius / zoneSize; j++) {
				const state = new ZoneState()

				state.x = i - maxMapRadius / zoneSize / 2
				state.y = j - maxMapRadius / zoneSize / 2

				this.zoneStates.push(state)
			}
		}
	}

	/**
	 * Finds the zone at the specified position
	 */
	findZone(x: number, y: number): ZoneState | null {
		return this.zoneStates.find((z) => z.x === x && z.y === y) ?? null
	}

	/**
	 * Finds the zone containing the specified coordinates
	 */
	findZoneByCoords(x: number, y: number): ZoneState | null {
		x = Math.floor(x / zoneSize)
		y = Math.floor(y / zoneSize)

		return this.zoneStates.find((z) => z.x === x && z.y === y) ?? null
	}

	addOrb(orb: OrbState) {
		let zone = this.findZoneByCoords(orb.x, orb.y)
		if (!zone) return console.warn(`Orb with coords [${orb.x}, ${orb.y}] spawned outside of map!`)

		zone!.orbs.add(orb)
	}

	removeOrb(orb: OrbState) {
		let zone = this.findZoneByCoords(orb.x, orb.y)
		if (!zone) return console.warn(`Orb with coords [${orb.x}, ${orb.y}] removed from outside of map!`)

		zone!.orbs.delete(orb)
	}

	tick() {}
}
