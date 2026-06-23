// Workspace-scoping guard. Every query runs through a tenant context.
export interface TenantContext {
  workspaceId: string;
  userId: string;
}

export async function currentTenant(): Promise<TenantContext> {
  // TODO: derive from the auth session.
  return { workspaceId: "dev-workspace", userId: "dev-user" };
}

export function assertWorkspace(record: { workspaceId: string }, ctx: TenantContext): void {
  if (record.workspaceId !== ctx.workspaceId) {
    throw new Error("Cross-workspace access denied");
  }
}
