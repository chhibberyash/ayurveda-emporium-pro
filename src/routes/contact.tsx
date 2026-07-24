import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSiteSettings } from "@/lib/settings";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Amrita Ayurveda" },
      { name: "description", content: "Get in touch with our team. Live chat, email, and phone support." },
      { property: "og:title", content: "Contact — Amrita Ayurveda" },
      { property: "og:description", content: "Get in touch with our team." },
    ],
  }),
  component: Contact,
});

const THREAD_KEY = "chat-thread-id";

function Contact() {
  const s = useSiteSettings();
  const { user } = useSession();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(THREAD_KEY);
    if (stored) setThreadId(stored);
  }, []);

  useEffect(() => {
    if (!threadId) return;
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("chat_messages").select("*").eq("thread_id", threadId).order("created_at");
      if (mounted) setMessages(data ?? []);
    };
    load();
    const ch = supabase
      .channel(`chat-${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `thread_id=eq.${threadId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [threadId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    let tid = threadId;
    if (!tid) {
      if (!user && (!guestName || !guestEmail)) return toast.error("Please enter your name and email");
      const { data, error } = await supabase
        .from("chat_threads")
        .insert({
          user_id: user?.id ?? null,
          guest_name: user ? null : guestName,
          guest_email: user ? null : guestEmail,
          subject: "Contact",
        })
        .select("id")
        .single();
      if (error || !data) return toast.error(error?.message ?? "Failed");
      tid = data.id;
      setThreadId(tid);
      localStorage.setItem(THREAD_KEY, tid);
    }
    const { error } = await supabase.from("chat_messages").insert({
      thread_id: tid,
      sender_role: user ? "user" : "guest",
      sender_id: user?.id ?? null,
      body: text,
    });
    if (error) return toast.error(error.message);
    await supabase.from("chat_threads").update({ last_message_at: new Date().toISOString() }).eq("id", tid);
    setText("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container-page py-12">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-accent">Reach us</p>
          <h1 className="font-heading text-4xl mt-2">Get in Touch</h1>
          <div className="ornament my-4 max-w-xs mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="card-elegant p-6">
              <h2 className="font-heading text-xl mb-4">Contact details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /><span>{s.contact_email}</span></div>
                {s.contact_phone && <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /><span>{s.contact_phone}</span></div>}
                {s.address && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /><span>{s.address}</span></div>}
              </div>
            </div>
          </div>
          <div className="card-elegant p-6 flex flex-col h-[500px]">
            <h2 className="font-heading text-xl mb-4">Live Chat</h2>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3">
              {messages.length === 0 && <p className="text-sm text-muted-foreground">Send a message and our team will reply as soon as possible.</p>}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_role === "admin" ? "justify-start" : "justify-end"}`}>
                  <div className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${m.sender_role === "admin" ? "bg-secondary" : "bg-primary text-primary-foreground"}`}>
                    {m.body}
                  </div>
                </div>
              ))}
            </div>
            {!threadId && !user && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="px-3 py-2 rounded border border-input bg-background text-sm" />
                <input placeholder="Email" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="px-3 py-2 rounded border border-input bg-background text-sm" />
              </div>
            )}
            <form onSubmit={send} className="flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message..." className="flex-1 px-3 py-2 rounded-full border border-input bg-background text-sm" />
              <button type="submit" className="btn-primary hover:bg-primary/90 p-2.5" aria-label="Send"><Send className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
