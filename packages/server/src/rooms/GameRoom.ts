import { Room, Client } from "@colyseus/core"

import { GameRoomState, OrbState, PlayerState } from "../schema/GameRoomState"
import { RotateData } from "../messages/RotateData"

import { PlayerController } from "../actors/PlayerController"
import { mapRadius, tickRate } from "../util"

export class GameRoom extends Room<GameRoomState> {
	maxClients = 100
	state = new GameRoomState()

	serverControllers = new Map<string, PlayerController>()

	onCreate(_options: any) {
		console.log("room", this.roomId, "created...")

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

			orbs.push(orb)
		}

		this.state.orbs.push(...orbs)

		// Set server tick-rate to a fixed 128
		let elapsedTime = 0
		this.setSimulationInterval((deltaTime) => {
			elapsedTime += deltaTime

			while (elapsedTime >= tickRate) {
				elapsedTime -= tickRate
				this.fixedTick(tickRate)
			}
		})

		this.onMessage("rotate", (client, data: RotateData) => {
			const controller = this.serverControllers.get(client.sessionId)
			if (controller == undefined) return

			controller.calculateMovement(data.pointer)
		})
	}

	fixedTick(tickRate: number) {}

	onJoin(client: Client, _options: any) {
		console.log(client.sessionId, "joined")

		let state = new PlayerState()

		this.state.players.set(client.sessionId, state)
		this.serverControllers.set(client.sessionId, new PlayerController(state))
	}

	onLeave(client: Client, _consented: boolean) {
		this.state.players.delete(client.sessionId)
		this.serverControllers.delete(client.sessionId)
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...")
	}
}
