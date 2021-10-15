import { useState } from "react";
import Head from "next/head";
import { GetServerSidePropsContext } from "next";

import { getAuthorizedApps } from "../api";
import manifests, { Manifest, ManifestId } from "../manifests";

type ManifestStatus = {
  authorizing: ManifestId[];
  revoking: ManifestId[];
};

type AuthorizationResponse = {
  key: string;
  secret: string;
};

type Props = {
  authorized?: ManifestId[];
};

export default function Index({ authorized = [] }: Props) {
  const [authorizedIds, setAuthorizedIds] = useState(authorized);

  const [manifestStatus, setManifestStatus] = useState<ManifestStatus>({
    authorizing: [],
    revoking: [],
  });

  function setManifestIdStatus(
    id: ManifestId,
    type: keyof ManifestStatus,
    nextStatus: boolean
  ) {
    const index = manifestStatus[type].findIndex((statusId) => statusId === id);

    if (nextStatus && index < 0) {
      setManifestStatus((manifestStatus) => ({
        ...manifestStatus,
        [type]: [...manifestStatus[type], id],
      }));
    } else if (!nextStatus) {
      setManifestStatus((manifestStatus) => {
        const nextStatusIds = manifestStatus[type].slice();
        nextStatusIds.splice(index, 1);
        return { ...manifestStatus, [type]: nextStatusIds };
      });
    }
  }

  async function handleAuthorize(id: ManifestId) {
    setManifestIdStatus(id, "authorizing", true);

    const manifest = manifests[id];

    const response = await fetch(`/api/apps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const { key, secret } = (await response.json()) as AuthorizationResponse;

    window.open(
      `${manifest.tokenCallbackUrl}?company=${process.env.NEXT_PUBLIC_CF_COMPANY}&key=${key}&secret=${secret}`,
      "_blank"
    );

    setAuthorizedIds((authorizedIds) => [...authorizedIds, id]);
    setManifestIdStatus(id, "authorizing", false);
  }

  async function handleLaunch(id: ManifestId) {
    window.open(manifests[id].homeUrl, "_blank");
  }

  async function handleRevoke(id: ManifestId) {
    setManifestIdStatus(id, "revoking", true);

    await fetch(`/api/apps/${id}`, {
      method: "DELETE",
    });

    setAuthorizedIds((authorizedIds) => {
      const index = authorizedIds.findIndex(
        (authorizedId) => authorizedId === id
      );

      const nextAuthorizedIds = authorizedIds.slice();
      nextAuthorizedIds.splice(index, 1);

      return nextAuthorizedIds;
    });

    setManifestIdStatus(id, "revoking", false);
  }

  return (
    <Page>
      <Head>
        <title>Checkfront Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Content>
        <Header />
        <Apps
          authorizedIds={authorizedIds}
          authorizingIds={manifestStatus.authorizing}
          revokingIds={manifestStatus.revoking}
          onAuthorize={handleAuthorize}
          onLaunch={handleLaunch}
          onRevoke={handleRevoke}
        />
      </Content>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {children}
    </div>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
      {children}
    </main>
  );
}

function Header() {
  return (
    <>
      <h1 className="text-6xl font-bold">Checkfront Marketplace</h1>
      <p className="mt-3 text-2xl">
        Install an app to add new capabilities to Checkfront
      </p>
    </>
  );
}

function Apps({
  authorizedIds,
  authorizingIds,
  revokingIds,
  onAuthorize,
  onLaunch,
  onRevoke,
}: {
  authorizedIds: ManifestId[];
  authorizingIds: ManifestId[];
  revokingIds: ManifestId[];
  onAuthorize: (manifestId: ManifestId) => void;
  onLaunch: (manifestId: ManifestId) => void;
  onRevoke: (manifestId: ManifestId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
      {Object.values(manifests).map((manifest) => {
        const isAuthorized = authorizedIds.includes(manifest.id);
        const isAuthorizing = authorizingIds.includes(manifest.id);
        const isRevoking = revokingIds.includes(manifest.id);

        return (
          <App
            key={manifest.id}
            manifest={manifest}
            isAuthorized={isAuthorized}
            isAuthorizing={isAuthorizing}
            isRevoking={isRevoking}
            onAuthorize={() => onAuthorize(manifest.id)}
            onLaunch={() => onLaunch(manifest.id)}
            onRevoke={() => onRevoke(manifest.id)}
          />
        );
      })}
    </div>
  );
}

function App({
  manifest,
  isAuthorized,
  isAuthorizing,
  isRevoking,
  onAuthorize,
  onLaunch,
  onRevoke,
}: {
  manifest: Manifest;
  isAuthorized: boolean;
  isAuthorizing: boolean;
  isRevoking: boolean;
  onAuthorize: () => void;
  onLaunch: () => void;
  onRevoke: () => void;
}) {
  return (
    <div
      key={manifest.id}
      className="p-6 mt-6 text-left border w-96 rounded-xl"
    >
      <img className="max-h-16 max-w-16" src={manifest.logoUrl} />
      <h3 className="mt-4 text-2xl font-bold">{manifest.name}</h3>
      <p className="mt-4 text-xl">{manifest.description}</p>
      <Buttons
        isAuthorized={isAuthorized}
        isAuthorizing={isAuthorizing}
        isRevoking={isRevoking}
        onAuthorize={onAuthorize}
        onLaunch={onLaunch}
        onRevoke={onRevoke}
      />
    </div>
  );
}

function Buttons({
  isAuthorized,
  isAuthorizing,
  isRevoking,
  onAuthorize,
  onLaunch,
  onRevoke,
}: {
  isAuthorized: boolean;
  isAuthorizing: boolean;
  isRevoking: boolean;
  onAuthorize: () => void;
  onLaunch: () => void;
  onRevoke: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      {!isAuthorized && (
        <AuthorizeButton
          className="mt-4"
          isAuthorizing={isAuthorizing}
          onClick={onAuthorize}
        />
      )}
      {isAuthorized && <LaunchButton className="mt-4" onClick={onLaunch} />}
      {isAuthorized && (
        <RevokeButton
          className="mt-4"
          isRevoking={isRevoking}
          onClick={onRevoke}
        />
      )}
    </div>
  );
}

function AuthorizeButton(
  props: React.HTMLAttributes<HTMLButtonElement> & { isAuthorizing: boolean }
) {
  const { isAuthorizing, ...buttonProps } = props;

  return (
    <Button
      {...buttonProps}
      className={`bg-blue-500 hover:bg-blue-700 ${buttonProps.className}`.trim()}
    >
      {isAuthorizing ? "Authorizing..." : "Authorize"}
    </Button>
  );
}

function LaunchButton(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...props}
      className={`bg-green-500 hover:bg-green-700 ${props.className}`.trim()}
    >
      Launch
    </Button>
  );
}

function RevokeButton(
  props: React.HTMLAttributes<HTMLButtonElement> & { isRevoking: boolean }
) {
  const { isRevoking, ...buttonProps } = props;

  return (
    <Button
      {...buttonProps}
      className={`bg-red-500 hover:bg-red-700 ${buttonProps.className}`.trim()}
    >
      {isRevoking ? "Revoking..." : "Revoke"}
    </Button>
  );
}

function Button(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`text-white font-bold py-2 px-4 rounded ${props.className}`.trim()}
    >
      {props.children}
    </button>
  );
}

export async function getServerSideProps(_context: GetServerSidePropsContext) {
  return {
    props: {
      authorized: await getAuthorizedApps(),
    },
  };
}
