import React from 'react'
import { DisplayGraph } from "../components/StaticGraphLoader.jsx"
import GridLayout from "react-grid-layout";
import Layout from '../components/layout.js';

//import '/node_modules/react-grid-layout/css/styles.css'
//import '/node_modules/react-resizable/css/styles.css'
import '../styles/global.css'
const ReviewPage = ({ location }) => {
    {
        const params = new URLSearchParams(location.search);
        // layout is an array of objects, see the demo for more complete usage
        const layout = [
            { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
            //{ i: "middle", x: 1, y: 0, w: 1, h: 2, static: true},
            { i: "b", x: 2, y: 0, w: 1, h: 2, static: true },
            { i: "c", x: 0, y: 2, w: 3, h: 2, static: true },
            
        ];
        console.log(params.get('logTitle'))
        return (
            <Layout>
                <div>
                    <h2 className='reviewEntry'>Reviewing " {params.get("logTitle")} "</h2>
                </div>

                <GridLayout
                    className="layout"
                    layout={layout}
                    cols={2}
                    rowHeight={300}
                    width={1600}
                >
                    <div key="a" className='graphpanel'>
                        <h2>Incomming graph</h2>

                        <DisplayGraph path='/graph/test.gexf' />

                    </div>
                    
                    <div key="b" className='graphpanel'>
                        <h2>Base graph</h2>
                        <DisplayGraph path='/graph/test.gexf' />
                    </div>
                    <div key="c" className='graphpanel'>
                        <h2>Merged graph</h2>
                        <DisplayGraph path='/graph/test.gexf' />
                    </div>
                </GridLayout>
            </Layout>
        );
    }
}

export default ReviewPage;