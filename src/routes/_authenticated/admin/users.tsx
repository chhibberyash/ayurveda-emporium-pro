import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ShieldOff, Ban, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: Users,
});

function Users() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles ?? []).map((p) => ({ ...p, roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role) }));
    },
  });
  const toggleAdmin = async (id: string, isAdmin: boolean) => {
    if (isAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
      toast.success("Admin removed");
    } else {
      await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
      toast.success("Admin granted");
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };
  const toggleBlock = async (id: string, blocked: boolean) => {
    await supabase.from("profiles").update({ blocked: !blocked }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    toast.success(blocked ? "Unblocked" : "Blocked");
  };
  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Users</h1>
      <div className="card-elegant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Roles</th><th className="p-3">Status</th><th className="p-3">Joined</th><th></th></tr></thead>
          <tbody>
            {data?.map((u: any) => {
              const isAdmin = u.roles.includes("admin");
              return (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3">{u.full_name ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{u.phone ?? "—"}</td>
                  <td className="p-3">
                    {isAdmin && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full mr-1">admin</span>}
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">customer</span>
                  </td>
                  <td className="p-3">{u.blocked ? <span className="text-destructive">Blocked</span> : <span className="text-primary">Active</span>}</td>
                  <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3 flex gap-2">
                    <button title={isAdmin ? "Revoke admin" : "Make admin"} onClick={() => toggleAdmin(u.id, isAdmin)}>{isAdmin ? <ShieldOff className="h-4 w-4"/> : <Shield className="h-4 w-4"/>}</button>
                    <button title={u.blocked ? "Unblock" : "Block"} onClick={() => toggleBlock(u.id, u.blocked)}>{u.blocked ? <CheckCircle className="h-4 w-4"/> : <Ban className="h-4 w-4 text-destructive"/>}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
