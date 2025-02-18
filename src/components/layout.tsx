import React from "react"
import { Slice } from "gatsby"

interface LayoutProps {
    children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <Slice alias="header" />
            <Slice alias="navbar" />
            {children}
            <Slice alias="footer" />
        </>
    )
}
