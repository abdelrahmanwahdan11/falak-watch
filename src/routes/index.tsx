import { createFileRoute } from "@tanstack/react-router";
import { Shop } from "@/components/shop";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Shop />;
}
