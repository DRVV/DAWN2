import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import {StaticImage} from "gatsby-plugin-image"
// @ts-ignore
import Layout from '../components/layout'
import {LoadGraph, DisplayGraph} from '../components/demograph.js'

const IndexPage: React.FC<PageProps> = () => {
  return (
    <Layout pageTitle='Home page'>
      <p>I'm proud that I could make this in free time.</p>
      <StaticImage alt="clifford, a redisshbrown pitbull, posin on a couch and looking stoically at the camera"
      src="../images/782.jpg"/>

      <DisplayGraph />
    </Layout>
    
  )
}


export default IndexPage

export const Head: HeadFC = () => <title>Home Page</title>
