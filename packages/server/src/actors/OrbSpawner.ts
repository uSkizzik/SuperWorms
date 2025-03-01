import { kdTree } from "kd-tree-javascript"

import { Actor } from "./Actor"

import { OrbState } from "../schema/GameRoomState"
import { GameRoom } from "../rooms/GameRoom"

import { mapRadius } from "../util"

/**
 * Shared player logic that runs on both client and server
 */
export class OrbSpawner extends Actor {
	room: GameRoom

	private tree: kdTree<{ x: number; y: number }> = new kdTree([], this.treeDistance, ["x", "y"])

	constructor(room: GameRoom) {
		super()
		this.room = room
	}

	spawnInitialOrbs() {
		// Calculate 50% of the map area and spawn orbs
		const mapArea = Math.sqrt(mapRadius) * Math.PI
		const orbAmount = mapArea * 5

		const orbs: OrbState[] = []
		for (let i = 0; i < orbAmount; i++) {
			const orb = new OrbState()

			orb.x = Math.floor(Math.random() * (mapRadius - -mapRadius) + -mapRadius)
			orb.y = Math.floor(Math.random() * (mapRadius - -mapRadius) + -mapRadius)
			orb.color = (Math.random() * 0xffffff) << 0
			orb.score = Math.floor(Math.random() * (5 - 1) + 1)

			this.spawnOrb(orb)
		}

		this.room.state.orbs.push(...orbs)
	}

	spawnOrb(orb: OrbState) {
		this.room.state.orbs.push(orb)
		// TODO: Do not rebuild tree on spawn, instead rebuild periodically
		this.rebuildTree()
	}

	// removePoint(point: { x: number; y: number }) {
	// 	this.room.state.orbs = this.room.state.orbs.filter((p) => p.x !== point.x || p.y !== point.y)
	// 	this.rebuildTree()
	// }

	/**
	 * Find the nearest orb at a specific point
	 * @param point
	 * @param range
	 */
	findNearest(point: { x: number; y: number }, range: number): { x: number; y: number } | null {
		if (!this.tree) return null
		const nearest = this.tree.nearest(point, 1, range)
		return nearest.length > 0 ? nearest[0][0] : null
	}

	private treeDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
		return Math.sqrt((a.x - b?.x) ** 2 + (a.y - b?.y) ** 2)
	}

	private rebuildTree() {
		this.tree = new kdTree(
			this.room.state.orbs.map((o) => ({ x: o.x, y: o.y })),
			this.treeDistance,
			["x", "y"]
		)
	}
}
