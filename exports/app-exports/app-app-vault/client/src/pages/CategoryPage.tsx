import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Package, ArrowLeft } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const categoryQuery = trpc.categories.bySlug.useQuery({ slug: slug! }, { enabled: !!slug });
  const appsQuery = trpc.apps.list.useQuery({ categorySlug: slug, limit: 20 }, { enabled: !!slug });

  const category = categoryQuery.data;
  const apps = appsQuery.data?.apps ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="border-b border-border bg-card/50">
        <div className="container py-8">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm" className="gap-1.5 mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Marketplace
            </Button>
          </Link>
          {category ? (
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ backgroundColor: `${category.color}20` }}>
                {category.icon ?? "📦"}
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">{category.name}</h1>
                {category.description && <p className="text-muted-foreground text-sm mt-1">{category.description}</p>}
              </div>
            </div>
          ) : (
            <div className="h-10 w-64 bg-muted rounded animate-pulse" />
          )}
        </div>
      </div>

      <div className="container py-10 flex-1">
        {appsQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : apps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {apps.map((item) => <AppCard key={item.app.id} data={item as any} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No apps in this category yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Check back soon or browse other categories</p>
            <Link href="/marketplace"><Button>Browse All Apps</Button></Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
