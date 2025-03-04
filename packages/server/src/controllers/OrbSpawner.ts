import { kdTree } from "kd-tree-javascript"

import { Controller } from "./Controller"

import { GameRoom } from "../rooms/GameRoom"

import { mapRadius } from "../util"
import { OrbState } from "../states/OrbState"

/**
 * Shared player logic that runs on both client and server
 */
export class OrbSpawner extends Controller {
	room: GameRoom

	private tree: kdTree<OrbState> = new kdTree([], this.treeDistance, ["x", "y"])

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

			orb.x = Math.floor(Math.random() * (mapRadius - -mapRadius) + -mapRadius)
			orb.y = Math.floor(Math.random() * (mapRadius - -mapRadius) + -mapRadius)
			orb.color = (Math.random() * 0xffffff) << 0
			orb.score = Math.floor(Math.random() * (5 - 1) + 1)

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
