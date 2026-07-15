import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { useOrderChat, type ChatSender } from "@/lib/store/order-chat-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Chat between the store and the customer for one order — e.g. the vendor
 * asking to substitute an out-of-stock brand. `sender` is which side of the
 * conversation the current viewer is on; the other side's messages align
 * left, the viewer's own align right.
 */
export function OrderChatBox({
  orderId,
  sender,
  title = "Chat with the store",
}: {
  orderId: string;
  sender: ChatSender;
  title?: string;
}) {
  const { messages, sendMessage } = useOrderChat(orderId);
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    sendMessage(sender, text);
    setText("");
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <MessageCircle className="size-3.5" />
        {title}
      </p>

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            No messages yet — ask about a substitution or anything else about this order.
          </p>
        ) : (
          messages.map((m) => {
            const own = m.sender === sender;
            return (
              <div key={m.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    own
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  }`}
                >
                  <p>{m.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${own ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {new Date(m.sentAt).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Type a message…"
        />
        <Button size="icon" onClick={submit} disabled={!text.trim()} aria-label="Send message">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
