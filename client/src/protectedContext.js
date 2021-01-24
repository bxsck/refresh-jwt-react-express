//to create context ,then export
import React from 'react';

const Context = React.createContext('null');

export class protectedStore extends React.Component{
    state = { content : 'null'}
    
    handleChange = e => {
        setUser({ ...user, [e.target.name]: e.target.value });
        console.log(user);
    };

    handleSubmit = e => {
        e.preventDefault();

        axios.post("http://localhost:5000/login", { user }).then(data => {
            const { accessToken, refreshToken } = data.data;

            Cookies.set("access", accessToken);
            Cookies.set("refresh", refreshToken);
        });
    };

    render(){
        return(
            <Context.Provider 
            value={{...this.state,
            handleSubmit:this.handleSubmit,
            handleChange:this.handleChange}}>
                {this.props.children}
            </Context.Provider>
        );
    }
}

export default protectedContext;