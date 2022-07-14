import './App.css';
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar.js";
import Playlists from "./components/Playlists/Playlists.js";
import Login from "./components/Login/Login.js";
import 'bootstrap/dist/css/bootstrap.min.css';


const App = () => {
	const [token, setToken] = useState("");
	const [loaded, setLoaded] = useState(false);

	const removeToken = () => {
		setToken("");
	}

	return ( 
		<>
			{!token ?
				<Login setToken={(token) => setToken(token)}/>
			: 
			<div className="main-container">
				<Navbar removeToken={removeToken} loaded={loaded}/>
				<Playlists setLoaded={() => setLoaded(true)}/>
			</div>
			}
		</>
	);
}

export default App;