import './Login.css';
import { useEffect, useState } from "react";

const Login = ({setToken}) => {

    // if token doesn't exist, update it on Spotify sign in
	useEffect(() => {
		// set up spotify sign in
		const hash = window.location.hash;
		let token = window.sessionStorage.getItem("token");
		
		// set token in session storage
		if (!token && hash) {
			token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
			window.location.hash = ""
			window.sessionStorage.setItem("token", token);
		}
		setToken(token);
	}, [])

	return ( 
		<>
        <section>
            <div className="login">
                <div className="title-text">Spotify Sentiment Albums</div>
                <div className="description">Curate emotion based playlists</div>
                <button className="spotify-auth" onClick={() => window.location.href=`${process.env.REACT_APP_AUTH_ENDPOINT}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=${process.env.REACT_APP_RESPONSE_TYPE}&scope=`}>Login via Spotify</button>
            </div>
        </section>
		</>
	);
}


export default Login;