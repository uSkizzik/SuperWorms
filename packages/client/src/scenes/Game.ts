import Phaser from "phaser"
import { Client, getStateCallbacks } from "colyseus.js"

import { PlayerController } from "@superworms/server/src/actors/PlayerController"
import type { GameRoomState, PlayerState } from "@superworms/server/src/schema/GameRoomState.ts"
import type { GameRoom } from "@superworms/server/src/rooms/GameRoom.ts"

import { Player } from "../actors/Player"
import { Orb } from "../actors/Orb"

export class Game extends Phaser.Scene {
	gameClient: Client
	room?: GameRoom

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
		this.localPlayer = new Player(this, 0, 0)
		this.add.existing(this.localPlayer)

		this.add.existing(new Orb(this, 500, 500, 1, 0x00ff00))

		// Setup and focus camera on local player actor
		this.cameras.main.zoomTo(1.5, 0.01)
		this.cameras.main.startFollow(this.localPlayer.headPos)

		// Create and setup room
		this.room = await this.gameClient.joinOrCreate<GameRoomState>("game_room")
		const $ = getStateCallbacks(this.room)

		$(this.room.state).players.onAdd((playerState: PlayerState, sessionId: string) => {
			// Create player controller and player actor (only if remote) and save it to the PC array
			if (sessionId !== this.room!.sessionId) {
				let actor = new Player(this, playerState.x, playerState.y)
				let controller = new PlayerController(sessionId, playerState, this.room!, actor)

				this.players.set(sessionId, controller)
			} else {
				this.players.set(sessionId, new PlayerController(sessionId, playerState, this.room!, this.localPlayer))
			}

			this.players.get(sessionId)!.actor!.setDataEnabled()

			$(playerState).listen("x", () => this.serverNewPositions(playerState, sessionId))
			$(playerState).listen("y", () => this.serverNewPositions(playerState, sessionId))
		})

		$(this.room!.state).orbs.onAdd((orb) => {
			new Orb(this, orb.x, orb.y, orb.score, orb.color)
		})
	}

	serverNewPositions(playerState: PlayerState, sessionId: string) {
		const controller = this.players.get(sessionId)
		if (!controller) throw "Missing player actor"

		if (!this.room) throw "Missing local room"

		controller.actor!.setData("serverX", playerState.x)
		controller.actor!.setData("serverY", playerState.y)
	}
}
