import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
    return (
        <div className="ui secondary pointing menu">
            <Link to="/" className="item">
                JWT PROTOTYPE
            </Link>
            <div className="right menu">
                <div className="item">
                    Menu | 
                </div>
                <Link to="/" className="item">LocalStorage</Link>
                <Link to="/Cookie" className="item">Cookies</Link>
                <Link to="/State" className="item">State</Link>
            </div>
        </div>
    )
}

export default Header
