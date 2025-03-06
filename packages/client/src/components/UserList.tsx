import { useEffect, useId } from "react"
import { useImmer } from "use-immer"

import { MapSchema } from "@colyseus/schema"
import { Types } from "@discord/embedded-app-sdk"

import { UserState } from "@superworms/server/src/states/UserState"

import { discord } from "../managers/Discord.ts"

import UserStatus from "./UserStatus.tsx"

function UserList({ users }: { users: MapSchema<UserState> }) {
	const [voiceStates, updateVoiceStates] = useImmer(new Map<string, Partial<Types.VoiceState & { speaking: boolean }>>())

	const startSpeaking = (data: { user_id: string }) => {
		updateVoiceStates((draft) => draft.set(data.user_id, { speaking: true }))
	}

	const stopSpeaking = (data: { user_id: string }) => {
		updateVoiceStates((draft) => draft.set(data.user_id, { speaking: true }))
	}

	const updateVoiceState = ({ voice_state }: { voice_state: Types.VoiceState }) => {}

	useEffect(() => {
		discord.subscribe("SPEAKING_START", startSpeaking, {})
		discord.subscribe("SPEAKING_STOP", stopSpeaking, {})
		discord.subscribe("VOICE_STATE_UPDATE", updateVoiceState, { channel_id: discord.channelId as string })

		return () => {
			discord.unsubscribe("SPEAKING_START", startSpeaking)
			discord.unsubscribe("SPEAKING_STOP", stopSpeaking)
			discord.unsubscribe("VOICE_STATE_UPDATE", updateVoiceState)
		}
	}, [])

	return <div className="tw:absolute tw:flex tw:flex-col tw:left-5">{users ? Array.from(users.values()).map((u, i) => <UserStatus key={i} voiceState={voiceStates.get(u.userId) || {}} user={u} />) : null}</div>
}

export default UserList
