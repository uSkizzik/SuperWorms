import { Room, Client } from "@colyseus/core"
import { GameRoomState, PlayerState } from "./schema/GameRoomState"

export class GameRoom extends Room<GameRoomState> {
	maxClients = 100
	state = new GameRoomState()

	onCreate(_options: any) {
		console.log("room", this.roomId, "created...")

		// this.onMessage("rotate", (client, data) => {
		// 	const player = this.state.players.get(client.sessionId)
		// 	if (player == undefined) return
		//
		// 	const dx = data.pointer.x - player.x
		// 	const dy = data.pointer.y - player.y
		//
		// 	const angle = Math.atan2(dy, dx)
		//
		// 	if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
		// 		player.angle = angle
		// 	}
		//
		// 	player.x += (player.speed / 100) * Math.cos(player.angle)
		// 	player.y += (player.speed / 100) * Math.sin(player.angle)
		// })
	}

	onJoin(client: Client, _options: any) {
		console.log(client.sessionId, "joined")
		this.state.players.set(client.sessionId, new PlayerState())
	}

	onLeave(client: Client, _consented: boolean) {
		// this.state.players.delete(client.sessionId)
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...")
	}
}
