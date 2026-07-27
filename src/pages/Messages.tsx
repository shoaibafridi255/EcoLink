import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, Search, ArrowLeft, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Conversation {
  id: string;
  material_id: string;
  seeker_id: string;
  lister_id: string;
  created_at: string;
  updated_at?: string;
  material_title?: string;
  other_name?: string;
  other_avatar?: string | null;
  last_message?: string;
  last_at?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const activeConvId = params.get("c");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    const fetchConvs = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!data) return;

      const enriched = await Promise.all(
        data.map(async (c) => {
          const { data: mat } = await supabase.from("materials").select("title").eq("id", c.material_id).maybeSingle();
          const otherId = c.seeker_id === user.id ? c.lister_id : c.seeker_id;
          const { data: prof } = await supabase.from("profiles").select("full_name, company, avatar_url").eq("id", otherId).maybeSingle();
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", c.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          return {
            ...c,
            material_title: mat?.title ?? "Unknown Material",
            other_name: prof?.company || prof?.full_name || "User",
            other_avatar: prof?.avatar_url ?? null,
            last_message: lastMsg?.content ?? "",
            last_at: lastMsg?.created_at ?? c.updated_at,
          };
        })
      );
      setConversations(enriched);
    };
    fetchConvs();
  }, [user]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConvId) { setMessages([]); return; }
    const fetchMsgs = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConvId)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };
    fetchMsgs();

    const channel = supabase
      .channel(`messages-${activeConvId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConvId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvId]);

  const handleSend = async () => {
    if (!user || !activeConvId || !newMsg.trim()) return;
    setSending(true);
    await supabase.from("messages").insert({ conversation_id: activeConvId, sender_id: user.id, content: newMsg.trim() });
    setNewMsg("");
    setSending(false);
  };

  if (authLoading) return null;

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.other_name?.toLowerCase().includes(q) ||
      c.material_title?.toLowerCase().includes(q) ||
      c.last_message?.toLowerCase().includes(q)
    );
  });

  const initials = (name?: string) =>
    (name ?? "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const relativeTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const dayLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-cream/40">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-10 max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Inbox</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-ink-deep mt-1">Messages</h1>
          </div>
          <p className="text-sm text-muted-foreground hidden md:block">
            {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid md:grid-cols-[340px_1fr] gap-4 h-[calc(100vh-190px)] rounded-3xl overflow-hidden border border-ink/10 bg-white shadow-card">
          {/* Conversation list */}
          <aside
            className={`flex flex-col border-r border-ink/10 bg-cream/30 ${
              activeConvId ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-ink/10">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="pl-9 bg-white border-ink/10 focus-visible:ring-ink"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                  <div className="w-14 h-14 rounded-2xl bg-ink-deep/5 flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6 text-ink-deep/60" />
                  </div>
                  <p className="font-medium text-ink-deep">
                    {search ? "No matches" : "No conversations yet"}
                  </p>
                  <p className="text-xs mt-1">
                    {search ? "Try a different search" : "Start one from a material page"}
                  </p>
                </div>
              ) : (
                <ul className="p-2 space-y-1">
                  {filtered.map((c) => {
                    const isActive = c.id === activeConvId;
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => navigate(`/messages?c=${c.id}`)}
                          className={`w-full text-left p-3 rounded-2xl flex gap-3 items-start transition-all ${
                            isActive
                              ? "bg-ink-deep text-white shadow-sm"
                              : "hover:bg-white"
                          }`}
                        >
                          <Avatar className="w-11 h-11 shrink-0 ring-2 ring-white">
                            {c.other_avatar && <AvatarImage src={c.other_avatar} alt={c.other_name} />}
                            <AvatarFallback className={isActive ? "bg-gold text-ink-deep" : "bg-ink-deep/10 text-ink-deep"}>
                              {initials(c.other_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`font-semibold text-sm truncate ${isActive ? "text-white" : "text-ink-deep"}`}>
                                {c.other_name}
                              </p>
                              <span className={`text-[10px] shrink-0 ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                                {relativeTime(c.last_at)}
                              </span>
                            </div>
                            <p className={`text-xs truncate flex items-center gap-1 mt-0.5 ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                              <Package className="w-3 h-3 shrink-0" />
                              {c.material_title}
                            </p>
                            {c.last_message && (
                              <p className={`text-xs truncate mt-1 ${isActive ? "text-white/70" : "text-muted-foreground/80"}`}>
                                {c.last_message}
                              </p>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Chat area */}
          <section className={`flex flex-col bg-white ${activeConvId ? "flex" : "hidden md:flex"}`}>
            {activeConvId && activeConv ? (
              <>
                <header className="px-5 py-4 border-b border-ink/10 flex items-center gap-3 bg-white">
                  <button
                    onClick={() => navigate("/messages")}
                    className="md:hidden p-1 rounded-lg hover:bg-muted"
                  >
                    <ArrowLeft className="w-5 h-5 text-ink-deep" />
                  </button>
                  <Avatar className="w-11 h-11 ring-2 ring-gold/30">
                    {activeConv.other_avatar && <AvatarImage src={activeConv.other_avatar} alt={activeConv.other_name} />}
                    <AvatarFallback className="bg-ink-deep/10 text-ink-deep">
                      {initials(activeConv.other_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-ink-deep truncate">{activeConv.other_name}</p>
                    <button
                      onClick={() => navigate(`/materials/${activeConv.material_id}`)}
                      className="text-xs text-muted-foreground hover:text-ink inline-flex items-center gap-1 group"
                    >
                      <Package className="w-3 h-3" />
                      <span className="group-hover:underline">Re: {activeConv.material_title}</span>
                    </button>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto px-5 py-6 bg-gradient-to-b from-cream/20 to-white">
                  <AnimatePresence initial={false}>
                    {messages.map((m, i) => {
                      const isMine = m.sender_id === user?.id;
                      const prev = messages[i - 1];
                      const showDay =
                        !prev || new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString();
                      const groupedWithPrev =
                        prev && prev.sender_id === m.sender_id && !showDay &&
                        new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 60_000 * 3;
                      return (
                        <div key={m.id}>
                          {showDay && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-ink/10" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {dayLabel(m.created_at)}
                              </span>
                              <div className="flex-1 h-px bg-ink/10" />
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex gap-2 items-end ${isMine ? "justify-end" : "justify-start"} ${
                              groupedWithPrev ? "mt-1" : "mt-3"
                            }`}
                          >
                            {!isMine && (
                              <Avatar className={`w-7 h-7 shrink-0 ${groupedWithPrev ? "invisible" : ""}`}>
                                {activeConv.other_avatar && <AvatarImage src={activeConv.other_avatar} />}
                                <AvatarFallback className="bg-ink-deep/10 text-ink-deep text-[10px]">
                                  {initials(activeConv.other_name)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[70%] group`}>
                              <div
                                className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                                  isMine
                                    ? "bg-ink-deep text-white rounded-2xl rounded-br-md"
                                    : "bg-white border border-ink/10 text-ink-deep rounded-2xl rounded-bl-md"
                                }`}
                              >
                                {m.content}
                              </div>
                              <p
                                className={`text-[10px] text-muted-foreground mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                  isMine ? "text-right" : "text-left"
                                }`}
                              >
                                {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>

                <div className="p-4 border-t border-ink/10 bg-white">
                  <div className="flex gap-2 items-center bg-cream/40 rounded-2xl p-1.5 border border-ink/10 focus-within:border-ink/30 transition-colors">
                    <Input
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      placeholder="Write a message…"
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={sending || !newMsg.trim()}
                      className="rounded-xl bg-ink-deep hover:bg-ink text-white shrink-0 h-9 w-9 p-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-cream/20 to-white">
                <div className="w-20 h-20 rounded-3xl bg-ink-deep/5 flex items-center justify-center mb-5">
                  <MessageCircle className="w-9 h-9 text-ink-deep/50" />
                </div>
                <h2 className="font-display text-xl font-bold text-ink-deep">Your conversations</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  Select a conversation from the left to continue the discussion, or start a new one from any material listing.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Messages;