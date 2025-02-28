import Phaser from "phaser"
import { Client } from "colyseus.js"

import { Orb } from "../actors/Orb.ts"
import { Player } from "../actors/Player.ts"

import { Room } from "colyseus.js"
import { GameRoomState } from "@superworms/server/src/rooms/schema/GameRoomState.ts"

export class Game extends Phaser.Scene {
	gameClient: Client
	room?: Room<GameRoomState>

	localPlayer?: Player
	players: Map<string, Player>

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

		this.room.onMessage("setup", () => {
			console.log(this.room?.state.players)
			this.room?.state.players.onAdd((player, sessionId) => {
				// Create foreign player actor
				this.players[sessionId] = new Player(this, player.x, player.y)

				player.onChange(() => {
					// Update local position for other player on change
					this.players[sessionId].x = player.x
					this.players[sessionId].y = player.y
				})
			})
		})
	}

	update() {
		this.localPlayer?.update()
	}
}
