import ClientSideHomePage from "@/components/csr-pages/Home";
import { getFeatured } from "@/sanity/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const featured = await getFeatured();
  return <ClientSideHomePage featured={featured} />;
}
