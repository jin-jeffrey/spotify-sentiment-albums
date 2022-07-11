import './Navbar.css';

const Navbar = ({removeToken, loaded}) => {

	const logout = () => {
        removeToken();
		window.sessionStorage.removeItem("token");
	}

	return (
		<>
			{loaded ? 
				<div className="nav">
					<button onClick={logout}>Logout</button>
				</div> : 
				<div className="nav">
				</div>
			}
		</>

	);
}

export default Navbar;