import { useEffect, useState } from "react"
import { Room } from "colyseus.js"

import { LobbyRoomState } from "@superworms/server/src/states/LobbyRoomState.ts"

import { colyseus } from "../managers/Colyseus.ts"
import { discord, isEmbedded } from "../managers/Discord.ts"

import Tips from "../components/Tips.tsx"
import UserStatus from "../components/UserStatus.tsx"

function Home({ status, setStatus, token, setPage, setUsername }: { status: string; setStatus: (val: string) => void; token: string | null; setPage: (val: "home" | "game") => void; setUsername: (val: string) => void }) {
	const [room, setRoom] = useState<Room<LobbyRoomState>>()
	const [fkngRefresh, setFkngRefresh] = useState(0)

	const startGame = () => {
		room?.leave()
		setPage("game")
	}

	room?.onStateChange(() => {
		setFkngRefresh(fkngRefresh + 1)
	})

	useEffect(() => {
		if (!token) return

		setStatus("Joining room")
		colyseus.joinOrCreate<LobbyRoomState>("lobby_room", { channelId: discord.channelId }).then((room) => {
			setRoom(room)
			setStatus("")
		})
	}, [token])

	return (
		<div className="tw:min-h-screen tw:p-4 tw:flex tw:items-center tw:flex-col">
			{(isEmbedded && !status) || !isEmbedded ? (
				<>
					{/*<button className="tw:mb-24 tw:self-start tw:flex tw:items-center tw:bg-amber-900 tw:rounded-full tw:shadow-lg tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:hover:bg-red-900" style={{ opacity: isLoggedIn || isEmbedded ? 0 : 1 }}>*/}
					{/*	<svg className="tw:h-6 tw:w-6 tw:mr-2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 -28.5 256 256" version="1.1" preserveAspectRatio="xMidYMid">*/}
					{/*		<g>*/}
					{/*			<path*/}
					{/*				d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"*/}
					{/*				fill="#fff"*/}
					{/*				fill-rule="nonzero"*/}
					{/*			></path>*/}
					{/*		</g>*/}
					{/*	</svg>*/}

					{/*	<span>Sign In with Discord</span>*/}
					{/*</button>*/}

					<div className="tw:absolute tw:flex tw:flex-col tw:left-5">{room?.state.users ? Array.from(room.state.users.values()).map((u) => <UserStatus user={u} />) : null}</div>

					<div className="tw:mt-26 tw:flex-grow tw:flex tw:items-center tw:flex-col">
						<img className="tw:w-lg" src="/superworms.png" alt="SuperWorms" />
						<Tips />
						{isEmbedded ? <span className="tw:mt-4 tw:opacity-50">Logged in as {room!.state.users?.get(room!.sessionId)?.username}</span> : <input className="tw:shadow-lg tw:mt-6 tw:bg-amber-900 tw:px-5 tw:py-3 tw:rounded-full tw:focus:bg-red-900 tw:focus:outline-none" placeholder="enter a nickname" onChange={(e) => setUsername(e.target.value)} />}
						<button className="tw:text-lg tw:font-bold tw:shadow-lg tw:mt-4 tw:bg-amber-700 tw:px-8 tw:py-2 tw:cursor-pointer tw:rounded-full tw:hover:bg-red-900" onClick={() => startGame()}>
							Play
						</button>
					</div>

					<div className="tw:text-sm">
						<a href="https://skizzium.com/terms">Terms of Service</a>
						<span className="tw:mx-2 tw:text-red-400">&ndash;</span>
						<a href="https://skizzium.com/privacy">Privacy Policy</a>
					</div>
				</>
			) : (
				<>
					<div className="tw:flex-grow tw:flex tw:items-center tw:justify-center tw:flex-col">
						<svg className="tw:size-12 tw:animate-[spin_1s_linear_infinite] tw:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="tw:opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path className="tw:opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span className="tw:mt-6 tw:text-lg tw:opacity-75 tw:font-semibold">{status}</span>
					</div>
					<div className="tw:bottom-8 tw:absolute tw:text-lg">
						<Tips />
					</div>
				</>
			)}
		</div>
	)
}

export default Home
