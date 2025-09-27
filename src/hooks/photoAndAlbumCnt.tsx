import { useStaticQuery, graphql } from "gatsby"

export const queryPhotoAndAlbumCnt = () => {
    const { site, allPhotoAlbum } = useStaticQuery(
        graphql`
      query SiteInfoQuery {
        allPhotoAlbum {
          totalCount
          edges {
            node {
              photos {
                name
              }
            }
          }
        }
      }
    `
    )

    const albumCount = allPhotoAlbum.totalCount
    const photoCount = allPhotoAlbum.edges.reduce((total: number, edge: any) => {
        return total + edge.node.photos.length
    }, 0)

    return {
        albumCount,
        photoCount
    }
}