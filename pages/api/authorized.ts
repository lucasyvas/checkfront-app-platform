import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import manifests, { ManifestId } from "../../manifests";

type TokenResponseData = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
};

const TOKEN_URL = `https://${process.env.NEXT_PUBLIC_CF_COMPANY}.checkfront.com/oauth/token?grant_type=authorization_code`;

export const AUTHORIZED = new Set<string>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST": {
      add(req, res);
      break;
    }

    default: {
      res.status(404).end();
      break;
    }
  }
}

async function add(req: NextApiRequest, res: NextApiResponse) {
  const id = req.body.id as ManifestId;
  const code = req.body.code as string;

  if (!(id && code)) {
    return res.status(400).end();
  }

  try {
    const { authCallbackUrl } = manifests[id];

    const response = await fetch(
      `${TOKEN_URL}&client_id=${process.env.CF_CONSUMER_KEY}&code=${code}`,
      {
        method: "POST",
      }
    );

    const data = (await response.json()) as TokenResponseData;

    fetch(authCallbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: data.access_token }),
    })
      .then(() => {
        console.log(
          `Auth callback hook delivery succeeded: ${authCallbackUrl}`
        );
      })
      .catch(() => {
        console.log(`Auth callback hook delivery failed: ${authCallbackUrl}`);
      });

    AUTHORIZED.add(id);

    res.status(204).end();
  } catch (error) {
    res.status(500).end();
  }
}

export function authorized() {
  return Array.from(AUTHORIZED);
}
