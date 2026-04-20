import { getCalendarPosts } from "@/lib/data/calendar-posts";
import { EditorialCalendarClient } from "./editorial-calendar-client";

export default async function CalendrierEditorialPage() {
  const initialPosts = await getCalendarPosts();
  return <EditorialCalendarClient initialPosts={initialPosts} />;
}
