import Phaser from "phaser"
import { Client } from "colyseus.js"

import { Orb } from "../actors/Orb.ts"
import { Player } from "../actors/Player.ts"

import type { Room } from "colyseus.js"
import type { GameRoomState } from "@superworms/server/src/rooms/schema/GameRoomState.ts"

export class Game extends Phaser.Scene {
	gameClient: Client
	room?: Room<GameRoomState>

	localPlayer?: Player

	constructor() {
		super("Game")

		this.gameClient = new Client("http://localhost:2567")
	}

	preload() {
		this.load.image("bg", "assets/bg.jpg")
	}

	async create() {
		this.background = this.add.tileSprite(0, 0, 10_000, 10_000, "bg")

		this.localPlayer = new Player(this, 100, 100)
		this.add.existing(this.localPlayer)

		this.add.existing(new Orb(this, 1000, 1000, 50, 0x00ff00))

		this.cameras.main.zoomTo(1.5, 0.01)
		this.cameras.main.startFollow(this.localPlayer.headPos)

		this.room = await this.gameClient.joinOrCreate<GameRoomState>("game_room")
	}

	update() {
		this.localPlayer.update()
	}
}
