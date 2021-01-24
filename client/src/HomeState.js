import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import api from './api'

const HomeState = () => {
    const [user, setUser] = useState({});
    const [content, setContent] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");

    const refresh = RT => {
        console.log("accessToken refreshing");

        return new Promise((resolve, reject) => {
            axios
                .post("http://localhost:5000/refresh", {token: RT })
                .then(data => {
                    if (data.data.success === false) {
                        setContent("Please Login (again)");
                        // set message and return.
                        resolve(false);
                    } else {
                        //const { accessToken } = data.data;
                        //const { refreshToken } = data.data;
                        //Cookies.set("accesss", accessToken);
                        //localStorage.setItem("access", accessToken);
                        //localStorage.setItem("refresh", refreshToken);
                        setAccessToken(data.data.accessToken);
                        setRefreshToken(data.data.refreshToken);
                        resolve(accessToken);
                    }
                });
        });
    };

    const protectedStatus = async (AT, RF) => {
        console.log("AT : ",AT,"RT : ", RF);
        return new Promise((resolve, reject) => {
            axios
                .post(
                    "http://localhost:5000/protected",
                    {},
                    { headers: { authorization: `Bearer ${AT}` } }
                )
                .then(async data => {
                    if (data.data.success === false) {
                        if (data.data.message === "User not authenticated") {
                            setContent("Login again");
                            // set err message to login again.
                        } else if (
                            data.data.message === "Access token expired"
                        ) {
                            AT = await refresh(RF);
                            if (AT != accessToken) setAccessToken(AT);
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
                    }
                });
        });
    };

    const handleChange = e => {
        setUser({ ...user, [e.target.name]: e.target.value });
        console.log(user);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        console.log("log in");
        await axios.post("http://localhost:5000/login", { user }).then(data => {
            //const { accessToken, refreshToken } = data.data;

            //Cookies.set("accesss", accessToken);
            //Cookies.set("refresh", refreshToken);
            //localStorage.setItem("access", accessToken);
            //localStorage.setItem("refresh", refreshToken);
            setAccessToken(data.data.accessToken);
            setRefreshToken(data.data.refreshToken);
            console.log("login success");
        });
        console.log("login AT : ", accessToken,"RT : ", refreshToken);
    };

    const hasAccess = async (AT, RF) => {
        if (!RF){
            setContent("Please Sign In to view protected content")
            return null;
        } 

        if (AT === undefined) {
            // generate new accessToken (old accessToken expired)
            AT = await refresh(RF);
            return AT;
        }

        return AT;
    };

    const protect = async e => {
        let AT = accessToken;
        let RT = refreshToken; 
        AT = await hasAccess(AT, RT);
        if (AT != accessToken) {setAccessToken(AT); AT=accessToken;}
        if (accessToken) {
            // Set message saying login again.
        } else {
            await protectedStatus(accessToken, refreshToken);
        }
    };

    const handleLogout = async () => {
        try {
          //setAppState({ ...appState, loading: true });
          //localStorage.removeItem("access");
          //localStorage.removeItem("refresh");
          setAccessToken(undefined);
          setRefreshToken(undefined);
          await axios.delete("http://localhost:5000/logout", { token: refreshToken });
          window.location.reload();
        } catch (error) {
          console.error(error);
          //setAppState({ ...appState, loading: false });
          //alert(error.response.data.error);
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

export default HomeState;
