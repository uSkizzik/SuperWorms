import Phaser from "phaser"
import { Client, Room, getStateCallbacks } from "colyseus.js"

import { GameRoomState, PlayerState } from "@superworms/server/src/schema/GameRoomState.ts"

import { Orb } from "../actors/Orb.ts"
import { Player } from "../actors/Player.ts"

export class Game extends Phaser.Scene {
	gameClient: Client
	room?: Room<GameRoomState>

	localPlayer?: Player

	// Map of sessionIds to player actors
	players: Map<string, Player> = new Map<string, Player>()

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

		this.add.existing(new Orb(this, 1000, 1000, 50, 0x00ff00))

		// Setup and focus camera on local player actor
		this.cameras.main.zoomTo(1.5, 0.01)
		this.cameras.main.startFollow(this.localPlayer.headPos)

		// Create and setup room
		this.room = await this.gameClient.joinOrCreate<GameRoomState>("game_room")
		const $ = getStateCallbacks(this.room)

		// Add local player to player map
		this.players.set(this.room.sessionId, this.localPlayer)
		this.localPlayer.setDataEnabled()

		$(this.room!.state).players.onAdd((playerState: PlayerState, sessionId: string) => {
			// Create foreign player actor
			if (sessionId !== this.room?.sessionId) this.players.set(sessionId, new Player(this, playerState.x, playerState.y))
			this.players.get(sessionId)!.setDataEnabled()

			$(playerState).listen("x", () => this.serverNewPositions(playerState, sessionId))
			$(playerState).listen("y", () => this.serverNewPositions(playerState, sessionId))
		})
	}

	update() {
		this.localPlayer?.updateLocal()

		this.players.forEach((player, sessionId) => {
			if (sessionId !== this.room?.sessionId) player.updateRemote()
		})
	}

	serverNewPositions(playerState: PlayerState, sessionId: string) {
		const playerActor = this.players.get(sessionId)
		if (!playerActor) throw "Missing local player actor"

		if (!this.room) throw "Missing local room"

		playerActor.setData("serverX", playerState.x)
		playerActor.setData("serverY", playerState.y)
	}
}
