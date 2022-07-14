import Dropdown from 'react-bootstrap/Dropdown';
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import {useEffect, useState} from "react";
import './Navbar.css';




const Navbar = ({removeToken, loaded}) => {
	const [imageUrl, setImageUrl] = useState("")

	useEffect(() => {
		getImage()
	}, [])

	const logout = () => {
        removeToken();
		window.sessionStorage.removeItem("token");
	}
	const getImage = async() => {
		const profileRes = await fetch('https://api.spotify.com/v1/me/', {
            headers: {
                'Authorization': 'Bearer ' + window.sessionStorage.token
            }
        });
        const profileData = await profileRes.json();
		setImageUrl(profileData.images[0].url)
	}



    return(
		<>
		{loaded && imageUrl!== "" ? 
			<div className="nav">
			<Dropdown>
            	<Dropdown.Toggle>
				<img className = "profile-image" src={imageUrl} alt='Profile Pic' width="75" height="75"/>
            	</Dropdown.Toggle>
				
           		<DropdownMenu>
                	<Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
            	</DropdownMenu>
        	</Dropdown>
			</div> : 
			<div className="nav">
			</div>
		 } 
		</>
		
    )
} 

export default Navbar;