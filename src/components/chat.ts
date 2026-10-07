import { useEffect, useLayoutEffect, useRef } from 'react';

/** Consecutive messages from one sender this close together share a bubble group. */
const GROUP_GAP_MS = 5 * 60 * 1000;

interface GroupableMessage {
  author: string;
  /** Epoch ms. Seed messages have none and group by sender alone. */
  sentAt?: number;
  mine?: boolean;
}

export function sameGroup(a: GroupableMessage, b: GroupableMessage): boolean {
  if (a.author !== b.author || !!a.mine !== !!b.mine) return false;
  return a.sentAt == null || b.sentAt == null || b.sentAt - a.sentAt <= GROUP_GAP_MS;
}

/**
 * Keeps a chat list scrolled to the newest message: jumps to the bottom whenever `resetKey` changes
 * (new message, channel switch), and stays pinned while content grows (fonts, emoji) unless the
 * user has scrolled up to read.
 */
export function useStickToBottom(resetKey: unknown) {
  const listRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);

  const scrollToBottom = () => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  };

  useLayoutEffect(() => {
    scrollToBottom();
    atBottom.current = true;
  }, [resetKey]);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const observer = new ResizeObserver(() => atBottom.current && scrollToBottom());
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  const onScroll = () => {
    const list = listRef.current;
    if (list) atBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 40;
  };

  return { listRef, innerRef, onScroll };
}
