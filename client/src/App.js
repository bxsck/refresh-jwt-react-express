import React from 'react'
import Home from './Home'
import Home2 from './Home2'
import HomeState from './HomeState'
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
                            <Route path="/" exact component={HomeState}/>
                            <Route path="/content" exact component={Content}/>
                        </Switch>
                </div>
            </Router>
        </div>
    )
}

export default App
