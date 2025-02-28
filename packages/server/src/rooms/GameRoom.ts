import { Room, Client } from "@colyseus/core"

import { GameRoomState, PlayerState } from "../schema/GameRoomState"
import { RotateData } from "../messages/RotateData"
import { calcPlayerMovement } from "../util"

export class GameRoom extends Room<GameRoomState> {
	maxClients = 100
	state = new GameRoomState()

	onCreate(_options: any) {
		console.log("room", this.roomId, "created...")

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
