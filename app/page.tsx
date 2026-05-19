import type { Metadata } from "next";
import { MainTabs } from "@/components/main-tabs";

export const metadata: Metadata = {
  title: "SSH Port Forwarding Manager",
  description:
    "Manage and visualize your SSH port forwarding tunnels with support for Local, Remote, and Dynamic (SOCKS) forwarding.",
  keywords: [
    "SSH", "Port Forwarding", "Tunnel", "SOCKS", "Proxy",
    "Local Forwarding", "Remote Forwarding",
  ],
};

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <MainTabs />
    </div>
  );
}
