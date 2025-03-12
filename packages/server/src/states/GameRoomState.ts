import { CollectionSchema, MapSchema, Schema, type } from "@colyseus/schema"

import { OrbState } from "./OrbState.ts"
import { PlayerState } from "./PlayerState.ts"
import { ZoneState } from "./ZoneState.ts"

export class GameRoomState extends Schema {
	// @type({ collection: OrbState }) orbs = new CollectionSchema<OrbState>()
	@type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}
