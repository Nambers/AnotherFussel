import React from "react"
import { Slice } from "gatsby"

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Slice alias="header" />
            <Slice alias="navbar" />
            {children}
            <Slice alias="footer" />
        </body>
    )
}
