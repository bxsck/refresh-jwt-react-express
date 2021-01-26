import React, { useState } from "react";
import axios from "axios";

const JWTLocalStorage = () => {
    const [user, setUser] = useState({});
    const [content, setContent] = useState("");

    const refresh = refreshToken => {
        console.log("accessToken refreshing");

        return new Promise((resolve, reject) => {
            axios
                .post("http://localhost:5000/refresh", {token: refreshToken })
                .then(data => {
                    if (data.data.success === false) {
                        setContent("Please Login (again)");
                        console.log("refreshToken expired. Please Log in again");
                        // set message and return.
                        resolve(false);
                    } else {
                        const { accessToken } = data.data;
                        const { refreshToken } = data.data;
                        //Cookies.set("accesss", accessToken);
                        localStorage.setItem("access", accessToken);
                        localStorage.setItem("refresh", refreshToken);
                        console.log("refreshing token success")
                        resolve(accessToken);
                    }
                });
        });
    };

    const protectedStatus = async (accessToken, refreshToken) => {
        console.log("accessing protected content with")
        console.log("AccessToken : ", localStorage.getItem("access"));
        console.log("RefreshToken : ", localStorage.getItem("refresh"));
        
        return new Promise((resolve, reject) => {
            axios
                .post(
                    "http://localhost:5000/protected",
                    {},
                    { headers: { authorization: `Bearer ${accessToken}` } }
                )
                .then(async data => {
                    if (data.data.success === false) {
                        if (data.data.message === "User not authenticated") {
                            console.log("User is not authenticated");
                            setContent("Login again");
                            // set err message to login again.
                        } else if (
                            data.data.message === "Access token expired"
                        ) {
                            console.log("accessToken expired.")
                            const accessToken = await refresh(refreshToken);
                            return await protectedStatus(
                                accessToken,
                                refreshToken
                            );
                        }

                        resolve(false);
                    } else {
                        // protected route has been accessed, response can be used.
                        setContent("Protected route accessed!");
                        resolve(true);
                        console.log("Protected Content Accessed")
                    }
                });
        });
    };

    const handleChange = e => {
        setUser({ ...user, [e.target.name]: e.target.value });
        console.log(user);
    };

    const handleSubmit = e => {
        e.preventDefault();
        console.log("Log in Submitted")
        axios.post("http://localhost:5000/login", { user }).then(data => {
            const { accessToken, refreshToken } = data.data;
            localStorage.setItem("access", accessToken);
            localStorage.setItem("refresh", refreshToken);
        });
        console.log("Log in success with");
        console.log("AccessToken : ", localStorage.getItem("access"));
        console.log("RefreshToken : ", localStorage.getItem("refresh"));
    };

    const hasAccess = async (accessToken, refreshToken) => {
        if (!refreshToken){
            setContent("Log in to view protected content")
            console.log("No refreshToken please log in");
            return null;
        } 

        if (accessToken === undefined) {
            // generate new accessToken (old accessToken expired)
            console.log("accessToken not valid with unexpected problem");
            accessToken = await refresh(refreshToken);

            return accessToken;
        }

        return accessToken; //return current token back if the token is still valid
    };

    const protect = async e => {
        let accessToken = localStorage.getItem("access");
        let refreshToken = localStorage.getItem("refresh");
        console.log("accessing protected content with")
        console.log("AccessToken : ", localStorage.getItem("access"));
        console.log("RefreshToken : ", localStorage.getItem("refresh"));

        accessToken = await hasAccess(accessToken, refreshToken); // Check if accessToken is valid

        if (!accessToken) {
            // Set content saying login again.
        } else {
            await protectedStatus(accessToken, refreshToken);
        }
    };

    const handleLogout = async () => {
        try {
          let refreshToken = localStorage.getItem("refresh");
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          await axios.delete("http://localhost:5000/logout", { token: refreshToken });
          window.location.reload();
          console.log("Logged out. refreshToken has ben removed")
        } catch (error) {
          console.error(error);
        }
      };

    return (
        <div className="ui container">
            <h3>JWT STORED IN LOCALSTORAGE</h3>
            <form className="ui form" action="" onChange={handleChange} onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="Email address" />
                <br />
                <br />

                <input name="password" type="password" placeholder="Password" />
                <br />
                <br />
                    <button type="submit" className="ui blue google button" value="Login">
                      <i className="sign-in icon" />
                        Sign In
                    </button>
                    
                <br />
                <br />
            </form>
            <div>
                Protected Content : {content}
            </div><br/>
            <div>
                <button className="ui blue button" onClick={protect}>Access Protected Content</button>
            </div><br/>
            <div>
                <button className="ui red google button" onClick={handleLogout}>
                      <i className="sign-out icon" />
                        Sign Out
                    </button>
            </div>
            
        </div>
    );
}

export default JWTLocalStorage;
