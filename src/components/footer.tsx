import * as React from "react"
import { custom_footer } from "../../config"
import { Footer, Content } from "react-bulma-components"
import { queryPhotoAndAlbumCnt } from "../hooks/photoAndAlbumCnt"
import { flatten_index } from "../../config"


export default function FooterComp() {
    const { albumCount, photoCount } = queryPhotoAndAlbumCnt();
    return (
        <Footer style={{ flex: 1 }}>
            <Content textAlign="center">
                {custom_footer}
                <p>
                    Powered by <strong><a href="https://github.com/Nambers/AnotherFussel">AnotherFussel</a></strong>. {
                        flatten_index
                            ? photoCount + " photos"
                            : albumCount + " albums and " + photoCount + " photos"
                    } loaded.
                </p>
            </Content>
        </Footer>
    )
}