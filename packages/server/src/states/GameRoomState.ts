import { MapSchema, Schema, type } from "@colyseus/schema"

import { PlayerState } from "./PlayerState.ts"

export class GameRoomState extends Schema {
	@type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}
