import React from 'react'
import { DisplayGraph } from "../components/StaticGraphLoader.jsx"
import GridLayout from "react-grid-layout";
import Layout from '../components/layout.js';

import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'

const ReviewPage = () => {
    {
        // layout is an array of objects, see the demo for more complete usage
        const layout = [
            { i: "a", x: 0, y: 0, w: 0.66, h: 2, static: true },
            { i: "b", x: 1, y: 0, w: 1.33, h: 2, maxW: 4 },
            { i: "c", x: 0, y: 1, w: 2, h: 2 }
        ];
        return (
            <Layout>
                
                <GridLayout
                    className="layout"
                    layout={layout}
                    cols={2}
                    rowHeight={300}
                    width={1200}
                >
                    <div key="a">
                        <h2>Incomming graph</h2>
                        <DisplayGraph />
                    </div>
                    <div key="b">
                        <h2>Base graph</h2>
                        <DisplayGraph />
                    </div>
                    <div key="c">
                        <h2>Merged graph</h2>
                        <DisplayGraph />
                    </div>
                </GridLayout>
            </Layout>
        );
    }
}

export default ReviewPage;