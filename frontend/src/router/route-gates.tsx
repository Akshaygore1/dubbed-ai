import { LoaderCircle } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AuthPage } from "@/pages/auth-page";
import { WorkspacePage } from "@/pages/workspace-page";
import { authClient } from "@/lib/auth-client";

export function AuthRoute() {
  const session = authClient.useSession();

  if (session.isPending) {
    return <RouteLoader label="Opening sign in" />;
  }

  if (session.data) {
    return <Navigate to="/workspace" replace />;
  }

  return <AuthPage />;
}

export function WorkspaceRoute() {
  const session = authClient.useSession();

  if (session.isPending) {
    return <RouteLoader label="Loading workspace" />;
  }

  if (!session.data) {
    return <Navigate to="/auth" replace />;
  }

  return <WorkspacePage />;
}

function RouteLoader({ label }: { label: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-(--color-text-dim)">
      <LoaderCircle className="mr-3 size-4 animate-spin text-(--color-blue)" />
      {label}
    </main>
  );
}
