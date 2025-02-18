import * as React from "react"
import Helmet from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"
import { custom_header } from "../../config"

export default function Header() {
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
        <header>
            <Helmet>
                <title>{titleQuery.site!.siteMetadata!.title!}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/1.0.3/css/bulma.min.css" />
                <script defer src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/js/all.min.js" />
                {custom_header}
            </Helmet>
        </header>
    )
}
