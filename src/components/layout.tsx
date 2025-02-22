import React from "react"
import { Slice } from "gatsby"

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
