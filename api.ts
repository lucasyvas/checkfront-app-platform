import fetch from "node-fetch";
import manifests, { ManifestId } from "./manifests";

export type Token = {
  clientId: string;
  clientSecret: string;
  name: string;
  authType: "token" | "oauth2";
  redirectUri: string;
  accountId: number;
  created: string;
};

export const API_V4_URL = `https://${process.env.NEXT_PUBLIC_CF_COMPANY}.checkfront.com/api/4.0`;

export const DEFAULT_HEADERS = {
  Authorization: `Basic ${Buffer.from(
    `${process.env.CF_API_KEY}:${process.env.CF_API_SECRET}`,
    "utf8"
  ).toString("base64")}`,
};

export async function getTokens() {
  const response = await fetch(`${API_V4_URL}/tokens`, {
    headers: DEFAULT_HEADERS,
  });

  return (await response.json()).data as Token[];
}

export async function getAuthorizedTokens() {
  const manifestIds = new Set(Object.keys(manifests) as ManifestId[]);

  return (await getTokens()).filter(
    ({ authType, name }) =>
      authType === "token" && manifestIds.has(name as ManifestId)
  );
}

export async function createToken(id: ManifestId) {
  const response = await fetch(`${API_V4_URL}/tokens`, {
    method: "POST",
    headers: { ...DEFAULT_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({ name: id, authType: "token" }),
  });

  return (await response.json()).data as Token;
}

export async function deleteToken(id: ManifestId) {
  const clientId = (await getAuthorizedTokens()).find(
    ({ name }) => name === id
  )?.clientId;

  const response = await fetch(`${API_V4_URL}/tokens/${clientId}`, {
    method: "DELETE",
    headers: DEFAULT_HEADERS,
  });

  return (await response.json()).data as Token;
}

export async function getAuthorizedApps() {
  return (await getAuthorizedTokens()).map(({ name }) => name as ManifestId);
}
