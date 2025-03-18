import { JWT } from "@colyseus/auth"
import { Room, Client } from "@colyseus/core"
import { Encoder, StateView } from "@colyseus/schema"

import { GameRoomState } from "../states/GameRoomState"
import { PlayerState } from "../states/PlayerState"
import { OrbState } from "../states/OrbState.ts"

import { RotateData } from "../messages/RotateData"

import { Controller } from "../controllers/Controller"

import { OrbSpawner } from "../controllers/OrbSpawner"
import { PlayerController } from "../controllers/PlayerController"
import { ZoneManager } from "../controllers/ZoneManager.ts"

import { tickRate } from "../util"

// Encoder.BUFFER_SIZE = 30 * 1024

export class GameRoom extends Room<GameRoomState> {
	maxClients = 100
	state = new GameRoomState()

	orbSpawner = new OrbSpawner(this)
	zoneManager = new ZoneManager(this)

	serverOrbs: Set<OrbState> = new Set()
	private serverControllers = new Map<string, PlayerController>()

	static async onAuth(token: string) {
		return token ? await JWT.verify(token) : {}
	}

	onCreate(_options: any) {
		this.setSimulationInterval(this.tick, tickRate)

		this.zoneManager.serverInitZones()

		this.onMessage("rotate", (client, data: RotateData) => {
			const controller = this.serverControllers.get(client.sessionId)
			if (controller == undefined) return

			controller.calculateAngle(data.pointer)
		})

		this.onMessage("startSprint", (client) => {
			const controller = this.serverControllers.get(client.sessionId)
			if (controller == undefined) return

			controller.startSprint()
		})

		this.onMessage("stopSprint", (client) => {
			const controller = this.serverControllers.get(client.sessionId)
			if (controller == undefined) return

			controller.stopSprint()
		})
	}

	private tick() {
		for (const actor of Controller.controllers) {
			actor.tick()
		}
	}

	onJoin(client: Client, _options: any) {
		client.view = new StateView()

		let state = new PlayerState()
		state.username = client.auth?.username

		let controller = new PlayerController(client, state, this)

		this.state.players.set(client.sessionId, state)
		this.serverControllers.set(client.sessionId, controller)
	}

	onLeave(client: Client, _consented: boolean) {
		this.state.players.delete(client.sessionId)
		this.serverControllers.delete(client.sessionId)
	}
}
