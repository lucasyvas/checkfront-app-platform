import Head from "next/head";
import manifests from "../manifests";

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Apps | CF Test Company (Checkfront)</title>
        <link rel="icon" href="/apps/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Checkfront App Platform</h1>
        <p className="mt-3 text-2xl">
          Install an app to add new capabilities to Checkfront
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          {manifests.map((manifest) => (
            <a
              key={manifest.id}
              href={`http://test.checkfront.com/apps/${manifest.id}`}
              className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
            >
              <h3 className="text-2xl font-bold">{manifest.name} &rarr;</h3>
              <p className="mt-4 text-xl">{manifest.description}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
