import { Schema, type } from "@colyseus/schema"

export class UserState extends Schema {
	@type("string") userId: string = ""
	@type("string") avatar: string = ""
	@type("string") username: string = ""
}
