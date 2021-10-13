import { useRouter } from "next/router";

export default function AppDetails() {
  const {
    query: { id },
  } = useRouter();

  return <>{id}</>;
}
