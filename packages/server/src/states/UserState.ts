import { Schema, type } from "@colyseus/schema"

export class UserState extends Schema {
	@type("string") username: string = ""
}
