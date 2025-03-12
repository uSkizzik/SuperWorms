import { randomInt } from "crypto"
import { kdTree } from "kd-tree-javascript"

import { Controller } from "./Controller"

import { GameRoom } from "../rooms/GameRoom"
import { OrbState } from "../states/OrbState"

import { EStatusEffect } from "../effects/EStatusEffect.ts"

import { mapRadius, maxOrbSpawnScore, minOrbSpawnScore, powerupChance } from "../util"

/**
 * Shared player logic that runs on both client and server
 */
export class OrbSpawner extends Controller {
	room: GameRoom

	private orbTree: kdTree<OrbState> = new kdTree<OrbState>([], this.treeDistance, ["x", "y"])
	private powerUpTree: kdTree<OrbState> = new kdTree<OrbState>([], this.treeDistance, ["x", "y"])

	constructor(room: GameRoom) {
		super()
		this.room = room
	}

	spawnInitialOrbs() {
		// Calculate 50% of the map area and spawn orbs
		const mapArea = Math.sqrt(mapRadius) * Math.PI
		const orbAmount = mapArea * 5

		for (let i = 0; i < orbAmount; i++) {
			const orb = new OrbState()
			// 10% chance to spawn a power-up
			const isPowerup = Math.random() <= powerupChance / 100

			orb.x = randomInt(-mapRadius, mapRadius)
			orb.y = randomInt(-mapRadius, mapRadius)
			orb.color = (Math.random() * 0xffffff) << 0

			// Power-ups give 10 score
			orb.score = !isPowerup ? randomInt(minOrbSpawnScore, maxOrbSpawnScore) : 10
			orb.statusEffect = isPowerup ? randomInt(1, Object.keys(EStatusEffect).length - 2) : 0

			this.spawnOrb(orb)
		}
	}

	spawnOrb(orb: OrbState) {
		this.room.serverOrbs.add(orb)
		this.room.zoneManager.addOrb(orb)

		// TODO: Do not rebuild tree on spawn, instead rebuild periodically
		this.rebuildTrees()
	}

	removeOrb(orb: OrbState) {
		this.room.serverOrbs.delete(orb)
		this.room.zoneManager.removeOrb(orb)

		this.rebuildTrees()
	}

	/**
	 * Find the nearest orb at a specific point
	 * @param point Point to search around for orbs
	 * @param range Radius from the point to search
	 * @param noPowerUps Ignore power-ups and return orbs only
	 */
	findNearest(point: { x: number; y: number }, range: number, noPowerUps: boolean = false): OrbState | null {
		if (!this.orbTree) return null

		const nearestOrb = this.orbTree.nearest(point as OrbState, 1, range)
		// if (noPowerUps)
		return nearestOrb.length > 0 ? nearestOrb[0][0] : null

		// const nearestPowerUp = this.powerUpTree.nearest(point as OrbState, 1, range)
		//
		// // Extract the closest points (if they exist)
		// const validPoint = nearestOrb.length > 0 ? nearestOrb[0] : null
		// const filteredPoint = nearestPowerUp.length > 0 ? nearestPowerUp[0] : null
		//
		// // If only one point exists, return it
		// if (!validPoint) return filteredPoint ? filteredPoint[0] : null
		// if (!filteredPoint) return validPoint ? validPoint[0] : null
		//
		// // Both points exist, compare distances
		// const validDistance = validPoint[1] // Second element is the distance
		// const filteredDistance = filteredPoint[1]
		//
		// return validDistance <= filteredDistance ? validPoint[0] : filteredPoint[0]
	}

	private treeDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
		return Math.sqrt((a.x - b?.x) ** 2 + (a.y - b?.y) ** 2)
	}

	private rebuildTrees() {
		this.orbTree = new kdTree<OrbState>(
			Array.from(this.room.serverOrbs),
			// .filter((o) => o.statusEffect === 0)
			this.treeDistance,
			["x", "y"]
		)

		// this.powerUpTree = new kdTree<OrbState>(
		// 	this.room.state.orbs.toArray().filter((o) => o.statusEffect > 0),
		// 	this.treeDistance,
		// 	["x", "y"]
		// )
	}
}
