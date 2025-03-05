import { MapSchema, Schema, type } from "@colyseus/schema"
import { UserState } from "./UserState.ts"

export class LobbyRoomState extends Schema {
	@type({ map: UserState }) users = new MapSchema<UserState>()
}
