import * as React from "react"
import { custom_footer } from "../../config"

export default function Footer() {
    return (
        <footer className="footer">
            <div className="content has-text-centered">
                {custom_footer}
                <p>
                    Powered by <strong><a href="https://github.com/Nambers/AnotherFussel">AnotherFussel</a></strong>. The source code is licensed under MIT.
                </p>
            </div>
        </footer>
    )
}