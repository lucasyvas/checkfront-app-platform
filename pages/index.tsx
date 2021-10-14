import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { GetServerSidePropsContext } from "next";

import { authorized } from "./api/authorized";
import manifests, { ManifestId } from "../manifests";
import { MessageChannel } from "../constants";

import { AuthorizationMessage } from "../types";

type AuthWindows = Partial<Record<ManifestId, Window>>;

type Props = {
  consumerKey: string;
  authorized?: ManifestId[];
};

const COMPANY_HOSTNAME = `${process.env.NEXT_PUBLIC_CF_COMPANY}.checkfront.com`;
const OAUTH_URL = `https://${COMPANY_HOSTNAME}/oauth?response_type=code`;
const REDIRECT_URI = `http://${COMPANY_HOSTNAME}/apps/auth`;

export default function Index({ consumerKey, authorized = [] }: Props) {
  const [authorizedIds, setAuthorizedIds] = useState(authorized);
  const authWindowsRef = useRef<AuthWindows>({});

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (location.origin !== event.origin) {
        return;
      }

      const message = event.data as AuthorizationMessage | null | undefined;

      if (message?.channel === MessageChannel.Auth) {
        authWindowsRef.current?.[message.id].close();

        authWindowsRef.current = {
          ...authWindowsRef.current,
          [message.id]: undefined,
        };

        setAuthorizedIds((authorizedIds) => [...authorizedIds, message.id]);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      authWindowsRef.current = {};
    };
  }, []);

  function handleButtonClick(id: ManifestId) {
    const url = authorizedIds.includes(id)
      ? manifests[id].homeUrl
      : `${OAUTH_URL}&client_id=${consumerKey}&redirect_uri=${REDIRECT_URI}/${id}`;

    authWindowsRef.current = {
      ...authWindowsRef.current,
      [id]: window.open(url, "_blank"),
    };
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Apps | Checkfront</title>
        <link rel="icon" href="/apps/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Checkfront App Platform</h1>
        <p className="mt-3 text-2xl">
          Install an app to add new capabilities to Checkfront
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          {Object.values(manifests).map((manifest) => (
            <div
              key={manifest.id}
              className="p-6 mt-6 text-left border w-96 rounded-xl cursor-pointer"
            >
              <img
                className="max-h-16 max-w-16"
                src={`/apps/apps/${manifest.id}.png`}
              />
              <h3 className="mt-4 text-2xl font-bold">{manifest.name}</h3>
              <p className="mt-4 text-xl">{manifest.description}</p>
              <Button
                className="mt-4"
                authorized={authorizedIds.includes(manifest.id)}
                onClick={() => handleButtonClick(manifest.id)}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Button({
  className,
  authorized,
  onClick,
}: {
  className?: string;
  authorized?: boolean;
  onClick: () => void;
}) {
  const label = authorized ? "Launch" : "Authorize";
  const bgColor = authorized ? "bg-green-500" : "bg-blue-500";
  const bgHover = authorized ? "hover:bg-green-700" : "hover:bg-blue-700";

  return (
    <button
      className={`${className.trim()} ${bgColor} ${bgHover} text-white font-bold py-2 px-4 rounded`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export async function getServerSideProps(_context: GetServerSidePropsContext) {
  return {
    props: {
      consumerKey: process.env.CF_CONSUMER_KEY,
      authorized: authorized(),
    },
  };
}
