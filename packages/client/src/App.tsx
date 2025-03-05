import { useEffect, useState } from "react"

import Home from "./pages/Home.tsx"
import Game from "./pages/Game.tsx"

import { authenticate } from "./managers/Auth.ts"
import { colyseus } from "./managers/Colyseus.ts"

function App() {
	const [page, setPage] = useState<"home" | "game">("home")
	const [status, setStatus] = useState<string>("Loading...")
	const [token, setToken] = useState<null | string>(null)
	const [username, setUsername] = useState<string>("")

	useEffect(() => {
		authenticate(setStatus).then((authData) => {
			colyseus.auth.token = authData?.token
			setToken(authData.token)
		})
	}, [])

	switch (page) {
		case "home":
			return <Home status={status} setStatus={setStatus} token={token} setPage={setPage} setUsername={setUsername} />

		case "game":
			return <Game username={username} />
	}
}

export default App
