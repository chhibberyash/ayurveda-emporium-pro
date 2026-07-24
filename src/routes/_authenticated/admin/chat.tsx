import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/chat")({
  component: ChatAdmin,
});

function ChatAdmin() {
  const qc = useQueryClient();
  const { user } = useSession();
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: threads } = useQuery({
    queryKey: ["threads"],
    queryFn: async () => (await supabase.from("chat_threads").select("*").order("last_message_at", { ascending: false })).data ?? [],
  });
  const { data: messages } = useQuery({
    queryKey: ["thread-messages", active],
    enabled: !!active,
    queryFn: async () => (await supabase.from("chat_messages").select("*").eq("thread_id", active!).order("created_at")).data ?? [],
  });

  useEffect(() => {
    if (!active) return;
    const ch = supabase
      .channel(`admin-chat-${active}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `thread_id=eq.${active}` }, () => {
        qc.invalidateQueries({ queryKey: ["thread-messages", active] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active, qc]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    await supabase.from("chat_messages").insert({ thread_id: active, sender_role: "admin", sender_id: user?.id, body: text });
    await supabase.from("chat_threads").update({ last_message_at: new Date().toISOString() }).eq("id", active);
    setText("");
    qc.invalidateQueries({ queryKey: ["thread-messages", active] });
  };

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Customer Messages</h1>
      <div className="grid grid-cols-3 gap-4 h-[70vh]">
        <div className="card-elegant p-3 overflow-y-auto">
          {!threads?.length ? <p className="text-sm text-muted-foreground p-4">No conversations yet.</p> :
            threads.map((t: any) => (
              <button key={t.id} onClick={() => setActive(t.id)} className={`w-full text-left p-3 rounded border-b border-border ${active === t.id ? "bg-secondary" : "hover:bg-secondary/50"}`}>
                <div className="font-medium">{t.guest_name ?? t.user_id?.slice(0, 8) ?? "User"}</div>
                <div className="text-xs text-muted-foreground">{t.guest_email ?? t.subject}</div>
                <div className="text-xs text-muted-foreground">{new Date(t.last_message_at).toLocaleString()}</div>
              </button>
            ))
          }
        </div>
        <div className="card-elegant p-4 col-span-2 flex flex-col">
          {!active ? <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div> : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3">
                {messages?.map((m: any) => (
                  <div key={m.id} className={`flex ${m.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`px-3 py-2 rounded-lg max-w-[75%] text-sm ${m.sender_role === "admin" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                      {m.body}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type reply..." className="flex-1 px-3 py-2 rounded-full border border-input bg-background text-sm" />
                <button type="submit" className="btn-primary hover:bg-primary/90 p-2.5"><Send className="h-4 w-4"/></button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
