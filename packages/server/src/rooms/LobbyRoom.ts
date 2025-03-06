import { JWT } from "@colyseus/auth"
import { Room, Client } from "@colyseus/core"

import { LobbyRoomState } from "../states/LobbyRoomState.ts"
import { UserState } from "../states/UserState.ts"

export class LobbyRoom extends Room<LobbyRoomState> {
	state = new LobbyRoomState()

	static async onAuth(token: string) {
		return token ? await JWT.verify(token) : {}
	}

	onCreate(_options: any) {
		console.log("Room", this.roomId, "created...")
	}

	onJoin(client: Client, _options: any) {
		console.log(client.sessionId, "joined")

		let state = new UserState()

		state.userId = client.auth?.id
		state.avatar = client.auth?.avatar
		state.username = client.auth?.global_name ?? client.auth?.username

		this.state.users.set(client.sessionId, state)
	}

	onLeave(client: Client, _consented: boolean) {
		this.state.users.delete(client.sessionId)
	}

	onDispose() {
		console.log("Room", this.roomId, "disposing...")
	}
}
