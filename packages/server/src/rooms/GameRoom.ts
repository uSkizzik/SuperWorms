import { Room, Client } from "@colyseus/core"

import { GameRoomState, OrbState, PlayerState } from "../schema/GameRoomState"
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

		// Set server tick-rate to a fixed 128
		let elapsedTime = 0
		this.setSimulationInterval((deltaTime) => {
			elapsedTime += deltaTime

			while (elapsedTime >= tickRate) {
				elapsedTime -= tickRate
				this.tick(tickRate)
			}
		})

		this.onMessage("rotate", (client, data: RotateData) => {
			const controller = this.serverControllers.get(client.sessionId)
			if (controller == undefined) return

			controller.calculateMovement(data.pointer)
		})
	}

	private tick(_tickRate: number) {
		for (const actor of Actor.actors) {
			actor.tick()
		}
	}

	onJoin(client: Client, _options: any) {
		console.log(client.sessionId, "joined")

		let state = new PlayerState()

		this.state.players.set(client.sessionId, state)
		this.serverControllers.set(client.sessionId, new PlayerController(state, this))
	}

	onLeave(client: Client, _consented: boolean) {
		this.state.players.delete(client.sessionId)
		this.serverControllers.delete(client.sessionId)
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...")
	}
}
