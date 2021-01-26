import React from 'react'
import JWTCookie from './JWTCookie'
import JWTLocalStorage from './JWTLocalStorage'
import HomeState from './JWTState'
import Content from './Content'
import Header from './Header'
import {Router, Route,Switch} from 'react-router-dom';
import history from './history';

function App() {
    return (
        <div className="ui container">
            <Router history={history}>
                <div>
                    <Header/>
                        <Switch>
                            <Route path="/" exact component={JWTLocalStorage}/>
                            <Route path="/Cookie" exact component={JWTCookie}/>
                            <Route path="/State" exact component={HomeState}/>
                        </Switch>
                </div>
            </Router>
        </div>
    )
}

export default App
