import { DemoApp } from "@/components/demo/DemoApp";
import { LiveApp } from "@/components/LiveApp";
import { DEMO_MODE } from "@/lib/demoMode";

export default function Home() {
  return DEMO_MODE ? <DemoApp /> : <LiveApp />;
}
