import Phaser from "phaser"
import { getStateCallbacks } from "colyseus.js"

import { PlayerController } from "@superworms/server/src/controllers/PlayerController.ts"

import type { GameRoomState } from "@superworms/server/src/states/GameRoomState.ts"
import type { PlayerState } from "@superworms/server/src/states/PlayerState.ts"

import type { GameRoom } from "@superworms/server/src/rooms/GameRoom.ts"

import { PlayerActor } from "../actors/PlayerActor"
import { OrbActor } from "../actors/OrbActor"

import { colyseus } from "../managers/Colyseus.ts"
import { isEmbedded } from "../managers/Discord.ts"

export class GameScene extends Phaser.Scene {
	room?: GameRoom
	localPlayer?: PlayerActor

	// Map of orb UUIDs to orb actors
	orbs = new Map<string, OrbActor>()
	// Map of sessionIds to player controllers
	players = new Map<string, PlayerController>()

	constructor() {
		super("GameScene")
	}

	preload() {
		this.load.setPath((isEmbedded ? ".proxy/" : "") + "assets/")
		this.load.image("bg", "bg.jpg")
	}

	async create() {
		this.add.tileSprite(0, 0, 10_000, 10_000, "bg")

		// Spawn local player actor
		this.localPlayer = new PlayerActor(this, 0, 0)
		this.add.existing(this.localPlayer)

		// Setup and focus camera on local player actor
		this.cameras.main.zoomTo(1.5, 0.01)
		this.cameras.main.startFollow(this.localPlayer.headPos)

		// Create and setup room
		this.room = await colyseus.joinOrCreate<GameRoomState>("game_room")
		const $ = getStateCallbacks(this.room)

		$(this.room!.state).players.onAdd((playerState: PlayerState, sessionId: string) => {
			// Create player controller and player actor (only if remote) and save it to the PC array

			let actor = sessionId !== this.room!.sessionId ? new PlayerActor(this, playerState.headPos.x, playerState.headPos.y) : this.localPlayer!
			let controller = new PlayerController(sessionId, playerState, this.room!, actor)

			this.players.set(sessionId, controller)
			actor!.setDataEnabled()

			$(playerState.headPos).listen("x", () => this.serverNewPositions(playerState, sessionId))
			$(playerState.headPos).listen("y", () => this.serverNewPositions(playerState, sessionId))
			$(playerState).listen("score", (value) => actor.updateLength(value))
		})

		$(this.room!.state).orbs.onAdd((orb) => {
			this.orbs.set(orb.id, new OrbActor(this, orb))
		})

		$(this.room!.state).orbs.onRemove((orb) => {
			this.orbs.get(orb.id)?.destroy()
			this.orbs.delete(orb.id)
		})
	}

	serverNewPositions(playerState: PlayerState, sessionId: string) {
		const controller = this.players.get(sessionId)
		if (!controller) throw "Missing player actor"

		if (!this.room) throw "Missing local room"

		controller.actor!.setData("serverX", playerState.headPos.x)
		controller.actor!.setData("serverY", playerState.headPos.y)
	}
}
