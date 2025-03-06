import { useEffect } from "react"

import { MapSchema } from "@colyseus/schema"
import { VoiceState } from "@discord/embedded-app-sdk/output/schema/types"

import { UserState } from "@superworms/server/src/states/UserState"

import { discord } from "../managers/Discord.ts"

import UserStatus from "./UserStatus.tsx"

function UserList({ users }: { users: MapSchema<UserState> }) {
	const startSpeaking = (data) => {}
	const stopSpeaking = (data) => {}
	const updateVoiceState = (newState: VoiceState) => {}

	useEffect(() => {
		discord.subscribe("SPEAKING_START", startSpeaking)
		discord.subscribe("SPEAKING_STOP", stopSpeaking)
		discord.subscribe("VOICE_STATE_UPDATE", updateVoiceState)

		return () => {
			discord.unsubscribe("SPEAKING_START", startSpeaking)
			discord.unsubscribe("SPEAKING_STOP", stopSpeaking)
			discord.unsubscribe("VOICE_STATE_UPDATE", updateVoiceState)
		}
	}, [])

	return <div className="tw:absolute tw:flex tw:flex-col tw:left-5">{users ? Array.from(users.values()).map((u) => <UserStatus user={u} />) : null}</div>
}

export default UserList
