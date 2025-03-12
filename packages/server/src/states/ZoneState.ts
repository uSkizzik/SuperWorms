import { CollectionSchema, type, view } from "@colyseus/schema"

import { PointState } from "./PointState"
import { OrbState } from "./OrbState.ts"

export class ZoneState extends PointState {
	@type({ collection: OrbState }) orbs = new CollectionSchema<OrbState>()
}
