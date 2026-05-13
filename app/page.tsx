import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TunnelManager } from "@/components/tunnel-manager";
import { DeploymentManager } from "@/components/deployment-manager";

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
      <Tabs defaultValue="tunnels" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tunnels">Túneles</TabsTrigger>
          <TabsTrigger value="deployments">Deployer</TabsTrigger>
        </TabsList>
        <TabsContent value="tunnels" className="mt-4">
          <TunnelManager />
        </TabsContent>
        <TabsContent value="deployments" className="mt-4">
          <DeploymentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}