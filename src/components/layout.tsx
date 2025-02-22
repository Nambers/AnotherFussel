import React from "react"
import { Slice } from "gatsby"
import 'bulma/css/bulma.min.css'

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <Slice alias="header" />
            <Slice alias="navbar" />
            {children}
            <Slice alias="footer" />
        </>
    )
}
