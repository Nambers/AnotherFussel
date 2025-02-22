import * as React from "react"
import Helmet from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"
import { custom_header } from "../../config"

export default function HeaderComp() {
    const titleQuery: Queries.titleQueryQuery = useStaticQuery(graphql`
        query titleQuery{
            site {
                siteMetadata {
                    title
                }
            }
        }
    `)
    return (
        <Helmet>
            <title>{titleQuery.site!.siteMetadata!.title!}</title>
            {custom_header}
        </Helmet>
    )
}
