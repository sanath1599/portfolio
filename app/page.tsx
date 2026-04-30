import { Shell } from "@/components/shell/Shell";
import { Blog } from "@/components/sections/Blog";

export default function Home() {
  return <Shell blogSlot={<Blog />} />;
}
