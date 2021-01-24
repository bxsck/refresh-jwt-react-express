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
                    Hello World
                </div>
                <Link to="/" className="item">Home</Link>
                <Link to="/content" className="item">Content</Link>
            </div>
        </div>
    )
}

export default Header
