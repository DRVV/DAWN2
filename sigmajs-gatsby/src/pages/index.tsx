import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import {StaticImage} from "gatsby-plugin-image"
// @ts-ignore
import Layout from '../components/layout'
import {LoadGraph, DisplayGraph} from '../components/demograph.js'

const IndexPage: React.FC<PageProps> = () => {
  return (
    <Layout pageTitle='Home page'>
      <DisplayGraph />
    </Layout>
    
  )
}


export default IndexPage

export const Head: HeadFC = () => <title>Home Page</title>
