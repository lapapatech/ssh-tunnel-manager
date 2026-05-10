import type { Metadata } from "next";
import { TunnelManager } from "@/components/tunnel-manager";

export const metadata: Metadata = {
  title: "SSH Port Forwarding Manager",
  description:
    "Manage and visualize your SSH port forwarding tunnels with support for Local, Remote, and Dynamic (SOCKS) forwarding.",
  keywords: [
    "SSH",
    "Port Forwarding",
    "Tunnel",
    "SOCKS",
    "Proxy",
    "Local Forwarding",
    "Remote Forwarding",
  ],
};

export default function Home() {
  return <TunnelManager />;
}
