import { Room, Client } from "@colyseus/core"

import { GameRoomState, PlayerState } from "../schema/GameRoomState"
import { RotateData } from "../messages/RotateData"

import { OrbSpawner } from "../actors/OrbSpawner"
import { PlayerController } from "../actors/PlayerController"

import { tickRate } from "../util"
import { Actor } from "../actors/Actor"

export class GameRoom extends Room<GameRoomState> {
	maxClients = 100
	state = new GameRoomState()

	orbSpawner = new OrbSpawner(this)
	private serverControllers = new Map<string, PlayerController>()

	onCreate(_options: any) {
		console.log("room", this.roomId, "created...")

		this.orbSpawner.spawnInitialOrbs()
		this.setSimulationInterval(this.tick, tickRate)

		this.onMessage("rotate", (client, data: RotateData) => {
			const controller = this.serverControllers.get(client.sessionId)
			if (controller == undefined) return

			controller.calculateAngle(data.pointer)
		})
	}

	private tick(deltaTime: number) {
		for (const actor of Actor.actors) {
			actor.tick()
		}
	}

	onJoin(client: Client, _options: any) {
		console.log(client.sessionId, "joined")

		let state = new PlayerState()

		this.state.players.set(client.sessionId, state)
		this.serverControllers.set(client.sessionId, new PlayerController(client.sessionId, state, this))
	}

	onLeave(client: Client, _consented: boolean) {
		this.state.players.delete(client.sessionId)
		this.serverControllers.delete(client.sessionId)
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...")
	}
}
