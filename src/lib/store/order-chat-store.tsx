import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";

export type ChatSender = "customer" | "vendor";

export type ChatMessage = {
  id: string;
  sender: ChatSender;
  text: string;
  sentAt: string;
};

type ChatState = Record<string, ChatMessage[]>;

const KEY = "blinko-order-chat-v1";

function isChatState(value: unknown): value is ChatState {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function newMessageId() {
  return `msg-${Math.random().toString(36).slice(2, 10)}`;
}

type OrderChatContextValue = {
  messagesFor: (orderId: string) => ChatMessage[];
  sendMessage: (orderId: string, sender: ChatSender, text: string) => void;
};

const OrderChatContext = createContext<OrderChatContextValue | null>(null);

const EMPTY_MESSAGES: ChatMessage[] = [];

/**
 * Per-order chat between the store and the customer — global (not scoped to
 * the vendor portal) since both the customer order page and the vendor
 * order detail panel read/write the same thread.
 */
export function OrderChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState<ChatState>(KEY, {}, isChatState);

  const messagesFor = useCallback((orderId: string) => state[orderId] ?? EMPTY_MESSAGES, [state]);

  const sendMessage = useCallback(
    (orderId: string, sender: ChatSender, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setState((prev) => ({
        ...prev,
        [orderId]: [
          ...(prev[orderId] ?? []),
          { id: newMessageId(), sender, text: trimmed, sentAt: new Date().toISOString() },
        ],
      }));
    },
    [setState],
  );

  const value = useMemo<OrderChatContextValue>(
    () => ({ messagesFor, sendMessage }),
    [messagesFor, sendMessage],
  );

  return <OrderChatContext.Provider value={value}>{children}</OrderChatContext.Provider>;
}

export function useOrderChat(orderId: string) {
  const ctx = useContext(OrderChatContext);
  if (!ctx) throw new Error("useOrderChat must be used within OrderChatProvider");
  return useMemo(
    () => ({
      messages: ctx.messagesFor(orderId),
      sendMessage: (sender: ChatSender, text: string) => ctx.sendMessage(orderId, sender, text),
    }),
    [ctx, orderId],
  );
}
