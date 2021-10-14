import { MessageChannel } from "./constants";
import { ManifestId } from "./manifests";

export type AuthorizationMessage = {
  channel: typeof MessageChannel.Auth;
  id: ManifestId;
};
