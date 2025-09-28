"use client";

import * as React from "react"
import { Layout } from "../components/layout"
import { PageProps } from "gatsby";
import { Container } from "react-bulma-components";
import { Icon } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Country, State, City } from 'country-state-city';

import 'leaflet/dist/leaflet.css';

const MapPage: React.FC<PageProps<object, { locDicts: { [slug: string]: { name: string, locDict: Record<string, number> } } }>> = ({ pageContext }) => {
    // fix https://github.com/Leaflet/Leaflet/issues/4968
    if (typeof window !== "undefined") {
        delete (Icon.Default.prototype as any)._getIconUrl;
        Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
            iconUrl: require('leaflet/dist/images/marker-icon.png').default,
            shadowUrl: require('leaflet/dist/images/marker-shadow.png').default
        });
    }

    const mapRef = React.useRef<HTMLDivElement>(null);
    const mapInstance = React.useRef<any>(null);
    // transform to "LOC": [album name]
    const allLocs: [string, string, Set<string>][] = [];

    Object.entries(pageContext.locDicts).forEach(([albumName, locDict]) => {
        Object.keys(locDict.locDict)
            .filter((loc) => loc && loc.trim() !== "")
            .forEach((loc) => {
                const [city, state, country] = loc.split(",").map(s => s.trim());
                let latitude: string | null | undefined = null;
                let longitude: string | null | undefined = null;

                if (city != "") {
                    const cities = City.getCitiesOfCountry(country.length === 2 ? country : (Country.getAllCountries().find(c => c.name === country)?.isoCode || ""));
                    if (cities) {
                        const matchedCity = cities.find(c => c.name === city && (state === "" || c.stateCode === state));
                        if (matchedCity) {
                            latitude = matchedCity.latitude;
                            longitude = matchedCity.longitude;
                        } else {
                            console.error(`City not found: ${city}, state: ${state}, country: ${country}, album: ${albumName}`);
                        }
                    } else {
                        console.error(`Cities not found for country: ${country}, album: ${albumName}`);
                    }
                } else if (state != "") {
                    const states = State.getStatesOfCountry(country.length === 2 ? country : (Country.getAllCountries().find(c => c.name === country)?.isoCode || ""));
                    if (states) {
                        const matchedState = states.find(s => s.name === state || s.isoCode === state);
                        if (matchedState) {
                            latitude = matchedState.latitude;
                            longitude = matchedState.longitude;
                        } else {
                            console.error(`State not found: ${state}, country: ${country}, album: ${albumName}`);
                        }
                    } else {
                        console.error(`States not found country: ${country}, album: ${albumName}`);
                    }
                } else if (country != "") {
                    const matchedCountry = Country.getAllCountries().find(c => c.name === country || c.isoCode === country);
                    if (matchedCountry) {
                        latitude = matchedCountry.latitude;
                        longitude = matchedCountry.longitude;
                    } else {
                        console.error(`Country not found: ${country}, album: ${albumName}`);
                    }
                } else {
                    console.error(`No valid location found for: ${loc}, album: ${albumName}`);
                }

                // Group album names by location
                if (latitude && longitude) {
                    const key = `${latitude},${longitude}`;
                    const existing = allLocs.find(([lat, lng]) => lat === latitude && lng === longitude);
                    if (existing) {
                        // Add album name to existing set
                        (existing[2] as Set<string>).add(albumName);
                    } else {
                        allLocs.push([latitude, longitude, new Set([albumName])]);
                    }
                }
            });
    });

    return (
        <Layout>
            <Container style={{ padding: "1.5em", width: "100%", margin: "0 auto", flex: 1 }}>
                <MapContainer style={{ width: "100%", height: "50vh", minHeight: "400px" }} center={[20, 0]} zoom={1} scrollWheelZoom={true}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
                    />
                    {allLocs.map(([lat, lng, names]) => (
                        <Marker key={`${lat},${lng}`} position={[Number(lat), Number(lng)]}>
                            <Popup>
                                {Array.from(names).map(slug => (
                                    <div key={slug}>
                                        <a href={`/albums/${slug}`}>{pageContext.locDicts[slug].name}</a>
                                    </div>
                                ))}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
                <div style={{
                    textAlign: "center",
                    marginTop: "1em",
                    color: "#888",
                    fontStyle: "italic"
                }}>
                    Map reflects locations of albums.
                </div>
            </Container>
        </Layout>
    )
}


export default MapPage;
