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

	private tree: kdTree<OrbState> = new kdTree<OrbState>([], this.treeDistance, ["x", "y"])

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
			orb.statusEffect = isPowerup ? 1 : 0 // randomInt(1, Object.keys(EStatusEffect).length - 1)

			this.spawnOrb(orb)
		}
	}

	spawnOrb(orb: OrbState) {
		this.room.state.orbs.add(orb)
		// TODO: Do not rebuild tree on spawn, instead rebuild periodically
		this.rebuildTree()
	}

	removeOrb(orb: OrbState) {
		this.room.state.orbs.delete(orb)
		this.rebuildTree()
	}

	/**
	 * Find the nearest orb at a specific point
	 * @param orb
	 * @param range
	 */
	findNearest(orb: { x: number; y: number }, range: number): OrbState | null {
		if (!this.tree) return null

		const nearest = this.tree.nearest(orb as OrbState, 1, range)
		return nearest.length > 0 ? nearest[0][0] : null
	}

	private treeDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
		return Math.sqrt((a.x - b?.x) ** 2 + (a.y - b?.y) ** 2)
	}

	private rebuildTree() {
		this.tree = new kdTree<OrbState>(this.room.state.orbs.toArray(), this.treeDistance, ["x", "y"])
	}
}
