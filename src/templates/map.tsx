import * as React from "react"
import { Layout } from "../components/layout"
import { PageProps } from "gatsby";
import { Container } from "react-bulma-components";
import {
    ComposableMap,
    Geographies,
    Geography
} from "react-simple-maps";

import "../styles/map.css"

const MapPage: React.FC<PageProps> = () => {
    return (
        <Layout>
            <Container>
                <div style={{ padding: "1.5em", margin: "0 auto" }}>
                    {/* <!-- style adapt from https://stackoverflow.com/a/63615485/14646226 --> */}
                    <ComposableMap
                        className="parchment"
                        projection="geoEquirectangular"
                        projectionConfig={{
                            scale: 147,
                            center: [0, 0]
                        }}
                        width={980}
                        height={551}
                    >
                        {/* map from https://github.com/topojson/world-atlas */}
                        <Geographies geography="/countries-50m.json">
                            {({ geographies }) =>
                                geographies.map(geo => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        className="land-geography"
                                        style={{
                                            default: {
                                                fill: "#d5b78a",
                                                stroke: "#8b4513"
                                            },
                                            hover: {
                                                fill: "#b38b5d",
                                                stroke: "#8b4513",
                                                cursor: "pointer"
                                            }
                                        }}
                                    />
                                ))
                            }
                        </Geographies>
                    </ComposableMap>
                </div>
                <svg>
                    <filter id="wavy2">
                        <feTurbulence x="0" y="0" baseFrequency="0.02" numOctaves="5" seed="1" />
                        <feDisplacementMap in="SourceGraphic" scale="20" />
                    </filter>
                </svg>

            </Container>
        </Layout >
    )
}

export default MapPage;
