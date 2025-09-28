"use client";

import * as React from "react"
import { Layout } from "../components/layout"
import { PageProps } from "gatsby";
import { Container, Hero, Breadcrumb, Heading, Card, Columns, Tag, Icon, Table } from "react-bulma-components";
import { FaCamera, FaEye, FaCalendar } from "react-icons/fa6";
import { SiSony, SiNikon } from "react-icons/si";
import type { IconType } from 'react-icons';

import '../styles/icon.css';

const BRANDS_ICONS: { [key: string]: IconType } = {
    "sony": SiSony,
    "nikon": SiNikon
};

interface GearPageContext {
    gears: {
        cameras: Array<{
            Brand: string;
            Type: string;
            Focus: string;
            Date: string;
            Gone?: boolean;
        }>;
        lens: Array<{
            Brand: string;
            Type: string;
            Focus: string;
            Date: string;
            SerialNum?: string;
            ProducedDate?: string;
            Gone?: boolean;
        }>;
    };
}

const GearPage: React.FC<PageProps<object, GearPageContext>> = ({ pageContext }) => {
    const { gears } = pageContext;

    const getBrandIcon = (brandName: string) => {
        const brand = brandName.toLowerCase().split(' ')[0]; // Get first word
        if (brand in BRANDS_ICONS) {
            const BrandIcon = BRANDS_ICONS[brand];
            return <BrandIcon size="1.5em" className="mr-2" />;
        }
        return;
    };

    return (
        <Layout>
            <Container style={{ padding: "1.5em", width: "100%", margin: "0 auto", flex: 1 }}>
                <Hero size="small">
                    <Hero.Body>
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <FaCamera size="1.33em" />
                                <Heading size={5} className="has-text-text" style={{ marginLeft: "1em" }}>
                                    Equipment Collection
                                </Heading>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                        <p className="subtitle has-text-grey">
                            My photography equipment collection and specifications
                        </p>
                    </Hero.Body>
                </Hero>

                {/* Equipment Collection */}
                <div style={{ marginBottom: "3rem" }}>
                    <Columns>
                        {/* Cameras */}
                        <Columns.Column>
                            <Card style={{ backgroundColor: "var(--card-bg)", height: "100%" }}>
                                <Card.Header>
                                    <Card.Header.Title className="has-text-text">
                                        <FaCamera className="mr-2" />
                                        Cameras
                                    </Card.Header.Title>
                                </Card.Header>
                                <Card.Content>
                                    {gears.cameras.map((camera, index) => (
                                        <div key={index} style={{
                                            marginBottom: "1.5rem",
                                            padding: "1rem",
                                            backgroundColor: "var(--bulma-scheme-main-bis)",
                                            borderRadius: "6px",
                                            border: camera.Gone ? "1px solid var(--bulma-border)" : "1px solid var(--primary)"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                                                {getBrandIcon(camera.Brand)}
                                                <div style={{ flex: 1 }}>
                                                    <Heading size={5} className={camera.Gone ? "has-text-grey" : "has-text-text"} style={{ margin: 0 }}>
                                                        {camera.Brand} {camera.Type}
                                                    </Heading>
                                                    <p className="has-text-grey" style={{ margin: 0 }}>
                                                        {camera.Focus}
                                                    </p>
                                                </div>
                                                {camera.Gone && (
                                                    <Tag color="light" size="medium">
                                                        GONE
                                                    </Tag>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <FaCalendar className="has-text-grey mr-2" style={{ verticalAlign: "middle" }} />
                                                <span className="has-text-grey">{camera.Date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </Card.Content>
                            </Card>
                        </Columns.Column>

                        {/* Lenses */}
                        <Columns.Column>
                            <Card style={{ backgroundColor: "var(--card-bg)", height: "100%" }}>
                                <Card.Header>
                                    <Card.Header.Title className="has-text-text">
                                        <FaEye className="mr-2" />
                                        Lenses
                                    </Card.Header.Title>
                                </Card.Header>
                                <Card.Content>
                                    {gears.lens.map((lens, index) => (
                                        <div key={index} style={{
                                            marginBottom: "1.5rem",
                                            padding: "1rem",
                                            backgroundColor: "var(--bulma-scheme-main-bis)",
                                            borderRadius: "6px",
                                            border: lens.Gone ? "1px solid var(--bulma-border)" : "1px solid var(--primary)"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                                                {getBrandIcon(lens.Brand)}
                                                <div style={{ flex: 1 }}>
                                                    <Heading size={5} className={lens.Gone ? "has-text-grey" : "has-text-text"} style={{ margin: 0 }}>
                                                        {lens.Brand.replace("Asahi Opt. Co.", "Asahi")} {lens.Type} {lens.Focus}
                                                    </Heading>
                                                </div>
                                                {lens.Gone && (
                                                    <Tag color="light" size="medium">
                                                        GONE
                                                    </Tag>
                                                )}
                                            </div>
                                            <div style={{ marginBottom: "0.5rem" }}>
                                                <FaCalendar className="has-text-grey mr-2" style={{ verticalAlign: "middle" }} />
                                                <span className="has-text-grey">{lens.Date}</span>
                                            </div>
                                            {lens.SerialNum && (
                                                <div style={{ marginBottom: "0.5rem" }}>
                                                    <span className="has-text-grey">S/N: {lens.SerialNum}</span>
                                                    {lens.ProducedDate && (
                                                        <span className="has-text-grey">, {lens.ProducedDate}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </Card.Content>
                            </Card>
                        </Columns.Column>
                    </Columns>
                </div>
            </Container>
        </Layout>
    )
}

export default GearPage;