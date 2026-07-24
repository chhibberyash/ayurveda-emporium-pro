import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pages/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Amrita Ayurveda` },
      { name: "description", content: `${params.slug} page` },
      { property: "og:title", content: `${params.slug} — Amrita Ayurveda` },
      { property: "og:description", content: `${params.slug} page` },
    ],
  }),
  component: PagePage,
});

function PagePage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container-page py-12 max-w-3xl">
        {isLoading ? (<div className="text-muted-foreground">Loading...</div>) : data && (
          <>
            <h1 className="font-heading text-4xl text-center">{data.title}</h1>
            <div className="ornament my-6 max-w-xs mx-auto" />
            <div className="prose max-w-none text-foreground [&_p]:mb-4 [&_p]:text-muted-foreground" dangerouslySetInnerHTML={{ __html: data.content }} />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
