import { Room, Client } from "@colyseus/core"

import { GameRoomState, OrbState, PlayerState } from "../schema/GameRoomState"
import { RotateData } from "../messages/RotateData"

import { calcPlayerMovement, mapRadius } from "../util"

export class GameRoom extends Room<GameRoomState> {
	maxClients = 100
	state = new GameRoomState()

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

		this.onMessage("rotate", (client, data: RotateData) => {
			const player = this.state.players.get(client.sessionId)
			if (player == undefined) return

			calcPlayerMovement(player, data.pointer)
		})
	}

	onJoin(client: Client, _options: any) {
		console.log(client.sessionId, "joined")
		this.state.players.set(client.sessionId, new PlayerState())
	}

	onLeave(client: Client, _consented: boolean) {
		this.state.players.delete(client.sessionId)
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...")
	}
}
