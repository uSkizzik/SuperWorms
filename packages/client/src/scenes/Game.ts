import Phaser from "phaser"
import { Client, Room, getStateCallbacks } from "colyseus.js"

import { PlayerController } from "@superworms/server/src/actors/PlayerController"
import type { GameRoomState, PlayerState } from "@superworms/server/src/schema/GameRoomState.ts"

import { Orb } from "../actors/Orb.ts"
import { Player } from "../actors/Player.ts"

export class Game extends Phaser.Scene {
	gameClient: Client
	room?: Room<GameRoomState>

	localPlayer?: Player

	// Map of sessionIds to player controllers
	players: Map<string, PlayerController> = new Map<string, PlayerController>()

	constructor() {
		super("Game")

		this.gameClient = new Client("http://localhost:2567")
	}

	preload() {
		this.load.image("bg", "assets/bg.jpg")
	}

	async create() {
		this.background = this.add.tileSprite(0, 0, 10_000, 10_000, "bg")

		// Spawn local player actor
		this.localPlayer = new Player(this, 100, 100)
		this.add.existing(this.localPlayer)

		this.add.existing(new Orb(this, 500, 500, 1, 0x00ff00))

		// Setup and focus camera on local player actor
		this.cameras.main.zoomTo(1.5, 0.01)
		this.cameras.main.startFollow(this.localPlayer.headPos)

		// Create and setup room
		this.room = await this.gameClient.joinOrCreate<GameRoomState>("game_room")
		const $ = getStateCallbacks(this.room)

		// Add local player to player map
		this.localPlayer.setDataEnabled()

		$(this.room!.state).players.onAdd((playerState: PlayerState, sessionId: string) => {
			// Create player controller and player actor (only if remote) and save it to the PC array
			if (sessionId !== this.room?.sessionId) {
				let actor = new Player(this, playerState.x, playerState.y)
				this.players.set(sessionId, new PlayerController(playerState, actor))
			} else this.players.set(this.room.sessionId, new PlayerController(playerState, this.localPlayer))

			this.players.get(sessionId)!.actor!.setDataEnabled()

			$(playerState).listen("x", () => this.serverNewPositions(playerState, sessionId))
			$(playerState).listen("y", () => this.serverNewPositions(playerState, sessionId))
		})

		// $(this.room!.state).orbs.onAdd((orb) => {
		// 	new Orb(this, orb.x, orb.y, orb.score, orb.color)
		// })
	}

	update() {
		this.localPlayer?.updateLocal()

		this.players.forEach((player, sessionId) => {
			if (sessionId !== this.room?.sessionId) player.actor!.updateRemote()
		})
	}

	serverNewPositions(playerState: PlayerState, sessionId: string) {
		const controller = this.players.get(sessionId)
		if (!controller) throw "Missing local player actor"

		if (!this.room) throw "Missing local room"

		controller.actor!.setData("serverX", playerState.x)
		controller.actor!.setData("serverY", playerState.y)
	}
}
