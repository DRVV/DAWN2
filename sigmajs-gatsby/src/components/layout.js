import * as React from 'react'
import {Link} from 'gatsby'
// import {container, heading, navLinks, navLinkItem, navLinkText} from './layout.module.css'
import { container, header, navLinks, navLinkItem, navLinkText, tab, tabs, prList, prItem, prInfo, prMeta, prTitle } from '../styles/pullrequests.module.css'
const Layout = ({ pageTitle, children }) => {
    return (
        <div className={container}>
            <h1>Knowledge Graph Manager</h1>
            <nav>
                <ul className={navLinks}>
                    <li className={navLinkItem}>
                        <Link to="/" className={navLinkText}>Home</Link>
                    </li>
                    <li className={navLinkItem}>
                        <Link to='/about' className={navLinkText}>About</Link>
                    </li>
                </ul>
            </nav>
            <main>
                <h1 className={header}>{pageTitle}</h1>
                {children}
            </main>
        </div>
    )
}

export default Layout