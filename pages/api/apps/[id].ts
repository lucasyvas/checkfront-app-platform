import { NextApiRequest, NextApiResponse } from "next";

import { deleteToken } from "../../../api";
import manifests, { Manifest, ManifestId } from "../../../manifests";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "DELETE": {
      return remove(req, res);
    }

    default: {
      return res.status(404).end();
    }
  }
}

async function remove(req: NextApiRequest, res: NextApiResponse) {
  const id =
    ((Array.isArray(req.query.id)
      ? req.query.id[0]
      : req.query.id) as ManifestId) ?? null;

  const manifest = manifests[id] as Manifest;

  if (!manifest) {
    return res.status(400).end();
  }

  try {
    await deleteToken(manifest.id);
    return res.status(204).end();
  } catch (error) {
    const status = error?.response?.status === 404 ? 404 : 500;
    return res.status(status).json(error);
  }
}
