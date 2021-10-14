import rawManifests from "./manifests.json";

type RawManifests = typeof rawManifests;

export type ManifestId = keyof RawManifests;

export type Manifests = {
  [Id in ManifestId]: RawManifests[Id] & {
    id: Id;
  };
};

export type Manifest = Manifests[ManifestId];

const manifests = Object.fromEntries(
  Object.entries(rawManifests).map(([id, manifest]) => [
    id,
    { ...manifest, id },
  ])
) as Manifests;

export default manifests;
