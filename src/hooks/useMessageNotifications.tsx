import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Ctx {
  unread: number;
  clear: () => void;
}

const MessageNotifCtx = createContext<Ctx>({ unread: 0, clear: () => {} });

export const MessageNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const locationRef = useRef(location);
  locationRef.current = location;

  const clear = () => setUnread(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }

    const channel = supabase
      .channel(`msg-notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          try {
            console.log("[msg-notif] INSERT received", payload);
            const msg = payload.new as { sender_id: string; conversation_id: string; content: string };
            console.log("[msg-notif] msg fields", { sender_id: msg?.sender_id, conversation_id: msg?.conversation_id, currentUser: user.id });
            if (!msg || !msg.sender_id) {
              console.warn("[msg-notif] payload.new missing fields");
              return;
            }
            if (msg.sender_id === user.id) return;

          // Verify this conversation belongs to the user (RLS should already ensure this)
          const { data: conv, error: convErr } = await supabase
            .from("conversations")
            .select("id, seeker_id, lister_id, material_id")
            .eq("id", msg.conversation_id)
            .maybeSingle();
          console.log("[msg-notif] conv lookup", { conv, convErr });
          if (!conv) return;
          if (conv.seeker_id !== user.id && conv.lister_id !== user.id) return;

          const loc = locationRef.current;
          const search = new URLSearchParams(loc.search);
          const viewingThis = loc.pathname === "/messages" && search.get("c") === msg.conversation_id;
          if (viewingThis) return;

          // Look up sender name
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name, company")
            .eq("id", msg.sender_id)
            .maybeSingle();
            const senderName = prof?.company || prof?.full_name || "New message";
            console.log("[msg-notif] toasting", senderName);
            setUnread((u) => u + 1);
            toast(senderName, {
              description: msg.content.length > 80 ? msg.content.slice(0, 80) + "…" : msg.content,
              action: {
                label: "View",
                onClick: () => navigate(`/messages?c=${msg.conversation_id}`),
              },
            });
          } catch (e) {
            console.error("[msg-notif] handler error", e);
          }
        }
      )
      .subscribe((status) => {
        console.log("[msg-notif] channel status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  // Clear badge whenever user is on messages page
  useEffect(() => {
    if (location.pathname === "/messages") setUnread(0);
  }, [location.pathname, location.search]);

  return (
    <MessageNotifCtx.Provider value={{ unread, clear }}>{children}</MessageNotifCtx.Provider>
  );
};

export const useMessageNotifications = () => useContext(MessageNotifCtx);