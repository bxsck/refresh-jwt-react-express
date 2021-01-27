import React, { useState } from "react";
import axios from "axios";
import { useApolloClient,gql} from '@apollo/client';

const JWTLocalStorage = () => {
    const [user, setUser] = useState({});
    const [content, setContent] = useState("");

    const client = useApolloClient()
    const query = gql`
      query MyTodoK {
        state {
          refreshToken
          accessToken 
        }
    }`
    const setToken = (refreshToken, accessToken)=>{
        client.writeQuery({
            query,
            data: {
                state : [{
                    refreshToken : refreshToken,
                    accessToken : accessToken
                }]
            },
            })
    }   

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
                        setToken(accessToken,refreshToken);
                        console.log("refreshing token success")
                        resolve(accessToken);
                    }
                });
        });
    };

    const protectedStatus = async (accessToken, refreshToken) => {
        console.log("accessing protected content with")
        console.log("AccessToken : ", accessToken);
        console.log("RefreshToken : ", refreshToken);
        
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
            setToken(refreshToken,accessToken);
        });
        
        console.log("Log in success");
    };

    const hasAccess = async (accessToken, refreshToken) => {
        if (!refreshToken){
            setContent("Log in to view protected content")
            console.log("No refreshToken please log in");
            return undefined;
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
        try{
        
            let token = client.readQuery({query});
            let accessToken = token['state']['0']['accessToken'];
            let refreshToken = token['state']['0']['refreshToken'];
            console.log("accessing protected content with")
            console.log("AccessToken : ", accessToken);
            console.log("RefreshToken : ", refreshToken);

            accessToken = await hasAccess(accessToken, refreshToken); // Check if accessToken is valid

            if (!accessToken) {
                // Set content saying login again.
            } else {
                await protectedStatus(accessToken, refreshToken);
            }
        } 
        catch (error) {
            console.log("Please log in");
            setContent("Please Log In");
            console.error(error);
          }
        

        
    };

    const handleLogout = async () => {
        try {
          let token = client.readQuery({query});
          let refreshToken = token['state']['0']['refreshToken'];
          setToken(undefined, undefined);
          await axios.delete("http://localhost:5000/logout", { token: refreshToken });
          window.location.reload();
          console.log("Logged out. refreshToken has ben removed")
        } catch (error) {
          console.error(error);
        }
      };

    return (
        <div className="ui container">
            <h3>JWT STORED IN APOLLO CACHE</h3>
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
