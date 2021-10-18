import { NextApiRequest, NextApiResponse } from "next";
import base64url from "base64url";

import { getAuthorizedApps, createToken } from "../../../api";
import manifests, { Manifest } from "../../../manifests";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST": {
      return add(req, res);
    }

    default: {
      return res.status(404).end();
    }
  }
}

async function add(req: NextApiRequest, res: NextApiResponse) {
  const manifest = manifests[req.body.id] as Manifest;

  if (!manifest) {
    return res.status(400).end();
  }

  if ((await getAuthorizedApps()).includes(manifest.id)) {
    return res.status(409).end();
  }

  try {
    const { clientId, clientSecret } = await createToken(manifest.id);

    return res
      .status(200)
      .json({ token: base64url(`${clientId}:${clientSecret}`) });
  } catch (error) {
    return res.status(500).json(error);
  }
}
