import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const Home = () => {
    const [user, setUser] = useState({});
    const [content, setContent] = useState("");

    const refresh = refreshToken => {
        console.log("Refreshing token!");

        return new Promise((resolve, reject) => {
            axios
                .post("http://localhost:5000/refresh", { token: refreshToken })
                .then(data => {
                    if (data.data.success === false) {
                        setContent("Please Login (again)");
                        // set message and return.
                        resolve(false);
                    } else {
                        const { accessToken } = data.data;
                        Cookies.set("access", accessToken);
                        resolve(accessToken);
                    }
                });
        });
    };

    const requestLogin = async (accessToken, refreshToken) => {
        console.log("AT : ",accessToken,"RT : ", refreshToken);
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
                            setContent("Login again");
                            // set err message to login again.
                        } else if (
                            data.data.message === "Access token expired"
                        ) {
                            const accessToken = await refresh(refreshToken);
                            return await requestLogin(
                                accessToken,
                                refreshToken
                            );
                        }

                        resolve(false);
                    } else {
                        // protected route has been accessed, response can be used.
                        setContent("Protected route accessed!");
                        resolve(true);
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

        axios.post("http://localhost:5000/login", { user }).then(data => {
            const { accessToken, refreshToken } = data.data;

            Cookies.set("access", accessToken);
            Cookies.set("refresh", refreshToken);
        });
    };

    const hasAccess = async (accessToken, refreshToken) => {
        if (!refreshToken) return null;

        if (accessToken === undefined) {
            // generate new accessToken (old accessToken expired)
            accessToken = await refresh(refreshToken);
            return accessToken;
        }

        return accessToken;
    };

    const protect = async e => {
        let accessToken = Cookies.get("access");
        let refreshToken = Cookies.get("refresh");

        accessToken = await hasAccess(accessToken, refreshToken);

        if (!accessToken) {
            // Set message saying login again.
        } else {
            await requestLogin(accessToken, refreshToken);
        }
    };

    return (
        <div className="ui container">
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
            </div>
            
        </div>
    );
}

export default Home;
