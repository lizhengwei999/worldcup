import { NewsCard } from "@/components/news-card";
import { SectionHeading } from "@/components/section-heading";
import { getNewsItems } from "@/lib/content-service";
import { getSection } from "@/lib/worldcup-data";

export default async function HeadlinesPage() {
  const section = getSection("headlines");
  const items = await getNewsItems("headlines");

  return (
    <main className="px-4 py-8 md:px-8">
      <SectionHeading description={section.description} title={section.title} />
      <div className="rounded-lg border border-ink/10 bg-paper px-4 shadow-score md:px-6">
        {items.map((item, index) => (
          <NewsCard item={item} key={item.id} priority={index === 0} />
        ))}
      </div>
    </main>
  );
}
