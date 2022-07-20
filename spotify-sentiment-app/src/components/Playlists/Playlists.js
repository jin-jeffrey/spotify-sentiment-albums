import './Playlists.css';
import {useEffect, useState} from 'react';
import {initializeApp} from 'firebase/app';
import { doc, setDoc, getDoc, getFirestore} from 'firebase/firestore';
import Loading from '../Loading/Loading';
import Toastify from 'toastify-js';
import Modal from 'react-modal';
import Button from 'react-bootstrap/Button';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import 'toastify-js/src/toastify.css';

// Initialize Modal
Modal.setAppElement('#root')

const Playlists = ({setLoaded}) => {
	const [playlists, setPlaylists] = useState([]);
	const [selectedPlaylist, setSelectedPlaylist] = useState({});
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState("");
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [albumName, setAlbumName] = useState("");
	const [albumDescription, setAlbumDescription] = useState("");
	const [percentageMood, setPercentageMood] = useState(0);

	// initialize firestore
	const firebaseConfig = {
		apiKey: process.env.REACT_APP_APIKEY,
		authDomain: process.env.REACT_APP_AUTHDOMAIN,
		databaseURL: process.env.REACT_APP_DATABASEURL,
		projectId: process.env.REACT_APP_PROJECTID,
		storageBucket: process.env.REACT_APP_STORAGEBUCKET,
		messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
		appId: process.env.REACT_APP_APPID,
		measurementId: process.env.REACT_APP_MEASUREMENTID
	}

	const app = initializeApp(firebaseConfig)
	const db = getFirestore(app)

	useEffect(() => {
		getPlaylists(window.sessionStorage.token)
		Toastify({
			text: "Logged in",
			duration: 3000,
			gravity: "top",
			position: "right",
			stopOnFocus: true,
			className: "toast-notification"
		}).showToast();
	}, [])

	useEffect(() => {
		if (playlists.length > 0) {
			getMoods();
		}
	}, [playlists])

	// retrieve playlists and songs
	const getPlaylists = async (token) => {
		// retrieve user id
		const profileRes = await fetch('https://api.spotify.com/v1/me/', {
			headers: {
				'Authorization': 'Bearer ' + token
			}
		});
		const profileData = await profileRes.json();
		setUserId(profileData.id)
		// retrieve playlists
		const res = await fetch('https://api.spotify.com/v1/me/playlists', {
			headers: {
				'Authorization': 'Bearer ' + token
			}
		});
		const data = await res.json();
		const playlists = data.items;
		// retrieve songs
		for (let playlist in playlists) {
			const res = await fetch(`https://api.spotify.com/v1/playlists/${playlists[playlist].id}/tracks`, {
				headers: {
					'Authorization': 'Bearer ' + window.sessionStorage.token
				}
			});
			const tracks = await res.json();
			// remove useless data
			playlists[playlist]['tracks'] = []
			for (let trackNumber in tracks.items) {
				let song = {}
				song["artists"] = tracks.items[trackNumber].track.artists;
				song["id"] = tracks.items[trackNumber].track.id;
				song["name"] = tracks.items[trackNumber].track.name;
				playlists[playlist]['tracks'].push(song);
			}
		}
		setSelectedPlaylist(playlists[0]);
		setPlaylists(playlists);
		setLoading(false);
		setLoaded();
	}

	// get moods for each song in each playlist
	const getMoods = async () => {
		for (let playlist in playlists) {
			for (let track in playlists[playlist].tracks) {
				let myHeaders = new Headers();
				myHeaders.append("Content-Type", "application/json");
				let artists = playlists[playlist].tracks[track].artists;
				let id = playlists[playlist].tracks[track].id;
				let name = playlists[playlist].tracks[track].name;
				const docRef = doc(db, "songs", id)
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					let data = docSnap.data();
					playlists[playlist].tracks[track].moods = data.moods;
				} else {
					let raw = JSON.stringify({
						"artists": artists,
						"id": id,
						"name": name
					});
					let requestOptions = {
						method: 'POST',
						headers: myHeaders,
						body: raw,
						redirect: 'follow'
					};
					await fetch("https://spotify-lyric-sentiment-server.herokuapp.com/sentiment", requestOptions)
					.then(response => response.json())
					.then(result => {
						setDoc(doc(db, "songs", result.id), result);
						playlists[playlist].tracks[track].moods = result.moods;
					})
					.catch(error => {
						Toastify({
							text: 'Could not retrieve lyrics for "' + name + '"',
							duration: 3000,
							gravity: "top",
							position: "right",
							stopOnFocus: true,
							className: "toast-notification"
						}).showToast();
					});
				}
			}
			Toastify({
				text: "Emotion Breakdown of " + playlists[playlist].name + " Complete",
				duration: 3000,
				gravity: "top",
				position: "right",
				stopOnFocus: true,
				className: "toast-notification"
			}).showToast();
			// Enable export
			playlists[playlist].export = true;
		}
	}

	const createPlaylist = async (name, description, pub) => {
		const new_data = {
			"name": name,
			"description": description,
			"public": pub
		}
		const playlistRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists` , {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + window.sessionStorage.token,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(new_data)
		});
		const results = await playlistRes.json();
		console.log(results);
	}

	const selectPlaylist = (playlist) => {
		setSelectedPlaylist(playlist);
	}

	const openModal = () => {
		setModalIsOpen(true);
	}

	const closeModal = () => {
		setModalIsOpen(false);
		setAlbumDescription("");
		setAlbumName("");
		setPercentageMood(0);
	}

	return (
		<>
		{
			loading ?
				<div className="loading-container">
					<Loading />
				</div>
			:
				<div className="app-container">
					<div className="playlists">
						{ playlists.map((playlist, index) => {
							return <button className={selectedPlaylist.id===playlist.id ? "selected playlist" : "playlist"} onClick={() => selectPlaylist(playlist)} key={index}>{playlist.name}</button>
						})}
					</div>
					<div className="songs">
						{ Object.keys(selectedPlaylist).length === 0 ? null : 
							<>
								<div className="playlist-header">
									<img className="album-image" alt="Playlist-Icon" src={selectedPlaylist.images[1]?.url}/>
									<div className="album-title">{selectedPlaylist.name}</div>
									<Button className={selectedPlaylist.export ? "export-btn" : "disabled export-btn"} variant="success" onClick={openModal}>Generate Albums</Button>
								</div>
								<div className="playlist-songs">
									{selectedPlaylist.tracks.map((song, index) => {
										return <div className="song" key={index}>{index+1} {song.name}, {song.artists[0].name}{song.moods && song.moods !== "N/A" ? <span className="moods-analysis">({Math.round(song.moods.Happy*100)}% Happy, {Math.round(song.moods.Sad*100)}% Sad, {Math.round(song.moods.Surprise*100)}% Surprised, {Math.round(song.moods.Angry*100)}% Angry, {Math.round(song.moods.Fear*100)}% Fear)</span> : null}</div>
									})}
								</div>
							</>
						}
					</div>
					<Modal 
						isOpen = {modalIsOpen} 
						onRequestClose = {closeModal}
						style={{
							overlay: {

							},
							content: {
								border: 0,
								background: "transparent",
								height: "70vh",
								width: "50vw",
								marginLeft: "auto",
								marginRight: "auto"
							}
						}}
					>
						<Carousel
							infiniteLoop = {false}
							showStatus = {false}
							showArrows = {false}
							showThumbs = {false}
						>
							<div>
								Select Mood
							</div>
							<div>
								<h1>Playlist Name</h1>
								<p>Playlist Description</p>
							</div>
							<div>
								new playlist contents
							</div>
						</Carousel>
					</Modal>
				</div>
			}
		</>
	);
}

export default Playlists;