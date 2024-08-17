import * as React from "react"
import { Link, type HeadFC, type PageProps } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
// @ts-ignore
import Layout from '../components/layout'
//import {LoadGraph, DisplayGraph} from '../components/demograph.js'

import { container, header, navLinks, navLinkItem, navLinkText, tab, tabs, prList, prItem, prInfo, prMeta, prTitle } from '../styles/pullrequests.module.css'
import '../styles/pullrequests.module.css'
const IndexPage: React.FC<PageProps> = () => {

  const logId = "test_0000"
  const logIssuedDate = "2024/07/31"
  const userName = "testUser"
  const updatedFile = "test file.gexf"
  const logTitle = `Processed file: ${updatedFile}`

  return (
    <Layout>
      <div className={container}>
        

        <div className={prList}>
          <div className={prItem}>
            <input type="checkbox" />
            <div className={prInfo}>
              
              <Link className={prTitle} to="/review">{logTitle}</Link>
              <div className={prMeta}>
                <span>#{logId} opened {logIssuedDate} by {userName}</span>
              </div>
            </div>
          </div>
          {/* Add more PR items here */}
        </div>
      </div>
    {/* // <Layout pageTitle='Home page'>
    //   <DisplayGraph />
    // </Layout> */}
    </Layout>
  )
}


export default IndexPage

export const Head: HeadFC = () => <title>Home Page</title>
