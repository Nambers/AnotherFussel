import * as React from "react"
import Helmet from "react-helmet"

export default function Header() {
    return (
        <header>
            <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/1.0.3/css/bulma.min.css" />
                <script defer src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/js/all.min.js" />
            </Helmet>
        </header>
    )
}
