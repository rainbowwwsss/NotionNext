// eslint-disable-next-line @next/next/no-document-import-in-page
import BLOG from '@/blog.config'
import {
  routeTransitionBootScript,
  routeTransitionBootStyles
} from '@/Fix/route-transition/appearanceBoot'
import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang={BLOG.LANG}>
        <Head>
          <style
            id='route-transition-boot-styles'
            dangerouslySetInnerHTML={{ __html: routeTransitionBootStyles }}
          />

          {BLOG.FONT_AWESOME && (
            <>
              <link
                rel='preload'
                href={BLOG.FONT_AWESOME}
                as='style'
                crossOrigin='anonymous'
              />
              <link
                rel='stylesheet'
                href={BLOG.FONT_AWESOME}
                crossOrigin='anonymous'
                referrerPolicy='no-referrer'
              />
            </>
          )}

          <script
            id='route-transition-boot-script'
            dangerouslySetInnerHTML={{ __html: routeTransitionBootScript }}
          />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
