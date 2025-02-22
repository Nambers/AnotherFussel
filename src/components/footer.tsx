import * as React from "react"
import { custom_footer } from "../../config"
import { Footer, Content } from "react-bulma-components"

export default function FooterComp() {
    return (
        <Footer>
            <Content textAlign="center">
                {custom_footer}
                <p>
                    Powered by <strong><a href="https://github.com/Nambers/AnotherFussel">AnotherFussel</a></strong>. The source code is licensed under MIT.
                </p>
            </Content>
        </Footer>
    )
}