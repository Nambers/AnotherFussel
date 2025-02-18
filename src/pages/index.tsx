import * as React from "react"
// import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Layout } from "../components/layout"
import { AlbumData } from "../../gatsby-node"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { PageProps, Link, HeadFC, graphql } from "gatsby"
import "../styles/index.css"

const IndexPage: React.FC<PageProps> = ({ data }) => {
  const albums: [AlbumData] = data.allPhotoAlbum.edges

  const generateCards = (albums: [AlbumData]) => {
    return albums.map((album: AlbumData) => generateCard(album.node))
  }

  const generateCard = (subject: AlbumData) => {
    return (
      <Link key={subject.slug} className="column is-one-quarter" to={"/albums/" + subject.slug}>
        <div className="card">
          <div className="card-image">
            <figure className="image is-4by3 subject-photo">
              <GatsbyImage
                className="subject-photo"
                image={getImage(subject.coverFile)}
                alt={subject.name} />
            </figure>
          </div>
          <div className="card-content">
            <div className="media-content">
              <p className="title is-5">{subject.name}</p>
              <p className="subtitle is-7">{subject.photos.length} Photo{subject.photos.length === 1 ? '' : 's'}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Layout>
      <div className="container">
        <section className="hero is-small">
          <div className="hero-body">
            <nav className="breadcrumb" aria-label="breadcrumbs">
              <ul>
                <li className="is-active">
                  <i className="fas fa-book fa-lg"></i>
                  <a className="title is-5" style={{ color: "black" }}>&nbsp;&nbsp;Albums</a>
                </li>
              </ul>
            </nav>
          </div>
        </section>
        <div className="columns is-multiline">
          {generateCards(albums)}
        </div>
      </div>
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Albums</title>

export const query = graphql`
  query IndexPageQuery {
    allPhotoAlbum {
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