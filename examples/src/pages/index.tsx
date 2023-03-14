import type { NextPage } from 'next'
import Head from 'next/head'
import { FLANExample } from '../components/examples/FLANExample'

const Home: NextPage = () => {
  return (
    <div className="p-0">
      <Head>
        <title>Talk to FLAN-T5</title>
        <meta name="description" content="Next.JS with WebAssembly" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen max-w-5xl mx-auto px-16 flex flex-1 flex-col justify-center content-center">
          <h1 className="text-3xl md:text-6xl font-semibold text-center mb-16">
          Welcome to <a href="https://en.wikipedia.org/wiki/Wikipedia:Large_language_models">LLMs</a> in the browser! 
        </h1>

        <div className="text-center">
          <FLANExample />
        </div>
      </main>
    </div>
  )
}

export default Home
