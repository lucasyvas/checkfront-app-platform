import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import manifests, { ManifestId } from "../../manifests";
import { MessageChannel } from "../../constants";

export default function Auth() {
  const router = useRouter();
  const { query } = router;

  const id =
    ((Array.isArray(query.id) ? query.id[0] : query.id) as ManifestId) ?? null;

  const code = (Array.isArray(query.code) ? query.code[0] : query.code) ?? null;

  useEffect(() => {
    (async () => {
      if (id && code) {
        await authorize(id, code);
      }
    })();
  }, [id, code]);

  const title = ["Apps", "Auth", manifests[id]?.name, "Checkfront"]
    .filter(Boolean)
    .join(" | ");

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
}

async function authorize(id: ManifestId, code: string) {
  await fetch("/apps/api/authorized", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, code }),
  });

  emitAuthorizationEvent(id);
}

function emitAuthorizationEvent(id: ManifestId) {
  window.opener?.postMessage(
    {
      channel: MessageChannel.Auth,
      id,
    },
    new URL(`http://${process.env.NEXT_PUBLIC_CF_COMPANY}.checkfront.com`)
      .origin
  );
}
