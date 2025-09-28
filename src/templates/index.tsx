"use client";

import * as React from "react"
import { Layout } from "../components/layout"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { PageProps, Link, graphql } from "gatsby"
import { FaBook } from "react-icons/fa6";
import { Container, Hero, Breadcrumb, Columns, Card, Heading } from "react-bulma-components"

type AlbumsType = Queries.IndexPageQueryQuery["allPhotoAlbum"]["edges"]

const IndexPage: React.FC<PageProps<Queries.IndexPageQueryQuery>> = ({ data }) => {
  const albums = data.allPhotoAlbum.edges

  const generateCards = (albums: AlbumsType) => {
    return albums.map((album: { node: AlbumsType[0]["node"]; }) => generateCard(album.node))
  }

  const generateCard = (subject: AlbumsType[0]["node"]) => {
    return (
      <Columns.Column size="one-quarter" key={subject.slug} renderAs={Link} to={"/albums/" + subject.slug}>
        <Card>
          <Card.Content style={{ padding: 0, overflow: 'hidden' }}>
            <figure className="image is-4by3">
              <GatsbyImage
                style={{
                  height: '100%',
                  width: '100%'
                }}
                image={getImage(subject.coverFile!.childImageSharp!.gatsbyImageData!)!}
                alt={subject.name}
                loading="lazy" />
            </figure>
          </Card.Content>
          <Card.Content>
            <Heading size={5}>{subject.name}</Heading>
            <Heading subtitle size={6}>{subject.photos.length} Photo{subject.photos.length === 1 ? '' : 's'}</Heading>
          </Card.Content>
        </Card>
      </Columns.Column>
    );
  }

  return (
    <Layout>
      <Container style={{ flex: 1 }}>
        <Hero size="small">
          <Hero.Body>
            <Breadcrumb>
              <Breadcrumb.Item active>
                <FaBook size="1.33em" />
                <Heading size={5} className="has-text-text" style={{ marginLeft: "1em" }} renderAs="a">Albums</Heading>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Hero.Body>
        </Hero>
        <Columns multiline>
          {generateCards(albums)}
        </Columns>
      </Container>
    </Layout>
  )
}

export default IndexPage

export const query = graphql`
  query IndexPageQuery {
    allPhotoAlbum(sort: { sortIndex: ASC }) {
      edges {
        node {
          name
          slug
          coverFile {
            childImageSharp {
              gatsbyImageData(width:500, height: 500, layout: CONSTRAINED, transformOptions: {fit: COVER})
            }
          }
          photos {
            exif
            slug
            path
          }
        }
      }
    }
  }
`