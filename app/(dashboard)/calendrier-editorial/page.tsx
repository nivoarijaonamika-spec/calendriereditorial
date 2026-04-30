import { getCalendarPosts } from "@/lib/data/calendar-posts";
import { EditorialCalendarClient } from "./editorial-calendar-client";

export default async function CalendrierEditorialPage() {
  const initialPosts = await getCalendarPosts();
  const now = new Date();

  return (
    <EditorialCalendarClient
      initialPosts={initialPosts}
      initialTodayParts={{
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
      }}
    />
  );
}
