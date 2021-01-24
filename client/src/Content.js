import React,{useState,useEffect} from 'react'
import axios from 'axios';
import Cookies from "js-cookie";

function Content() {
    const [txt,setTxt] = useState("login plz");
    useEffect(()=>{
        let accessToken = Cookies.get("access");
        let refreshToken = Cookies.get("refresh");

        const res = () => new Promise((resolve, reject) => {
            axios
                .post(
                    "http://localhost:5000/protected",
                    {},
                    { headers: { authorization: `Bearer ${accessToken}` } }
                )
                .then(async data => {
                    if (data.data.success === false) {
                        if (data.data.message === "User not authenticated") {
                            setTxt("Login again");
                            // set err message to login again.
                        }
                        resolve(false);
                    } else {
                        // protected route has been accessed, response can be used.
                        setTxt("Protected route accessed!");
                        resolve(true);
                    }
                });
        });
    },)
    return (
        <div>
            {txt}
        </div>
    )
}

export default Content
