import React from 'react'
import JWTCookie from './JWTCookie'
import JWTLocalStorage from './JWTLocalStorage'
import State from './JWTState'
import Apollo from './Apollo'
import Header from './Header'

import { InMemoryCache, ApolloClient, ApolloProvider } from '@apollo/client';
import { Switch, Route,BrowserRouter } from 'react-router-dom';

function App() {
    let client = new ApolloClient({cache: new InMemoryCache(),})
    return (
        <div className="ui container">
            <BrowserRouter>
                <ApolloProvider client={client} >
                <div>
                    <Header/>
                        <Switch>
                            <Route path="/" exact component={JWTLocalStorage}/>
                            <Route path="/Cookie" exact component={JWTCookie}/>
                            <Route path="/State" exact component={State}/>
                            <Route path="/Apollo" exact component={Apollo}/>
                        </Switch>
                </div>
                </ApolloProvider>
            </BrowserRouter>
        </div>
    )
}

export default App
