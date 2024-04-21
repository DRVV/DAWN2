import * as React from 'react'
import Layout from '../components/layout'

const AboutPage = () => {
    return (
        <Layout pageTitle='about'>
            hi, this is an about page build with Gatsby.
        </Layout>
    )
}
export const Head = () => <title>About this page</title>
export default AboutPage