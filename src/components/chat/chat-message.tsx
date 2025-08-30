"use client";

import { useState } from "react";
import { Bot, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatMessage as ChatMessageType } from "@/lib/chat-api";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
  agentName: string;
  isStreaming?: boolean;
}

export function ChatMessage({
  message,
  agentName,
  isStreaming,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  // Debug log to check content
  console.log("Message content:", message.content);
  console.log("Message role:", message.role);

  return (
    <div className={cn("flex gap-4 group", isUser && "justify-end")}>
      {isAssistant && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}

      <div
        className={cn("flex flex-col gap-2 max-w-[80%]", isUser && "items-end")}
      >
        <div className="flex items-center gap-2">
          {isAssistant && (
            <Badge variant="secondary" className="text-xs">
              {agentName}
            </Badge>
          )}
          {isUser && (
            <Badge variant="outline" className="text-xs">
              You
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div
          className={cn(
            "relative rounded-lg px-4 py-3 text-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted",
            isStreaming && "min-h-[40px]"
          )}
        >
          {message.content ? (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  code: ({ children, className, ...props }: any) => {
                    const isInline = !className?.includes("language-");
                    return (
                      <code
                        className={cn(
                          "font-mono",
                          isInline
                            ? "px-1.5 py-0.5 rounded text-xs bg-background/20 border"
                            : "block p-3 rounded bg-background/20 border overflow-x-auto text-xs"
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <div className="my-3 rounded bg-background/20 border p-3 overflow-x-auto">
                      {children}
                    </div>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-border pl-4 italic my-3 text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-3 mt-2">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold mb-2 mt-2">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold mb-2 mt-2">
                      {children}
                    </h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  hr: () => <hr className="my-4 border-border" />,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="border-collapse border border-border text-xs w-full">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-2 py-1 bg-muted font-semibold text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-2 py-1">
                      {children}
                    </td>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-primary underline hover:no-underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            isStreaming && <span className="text-muted-foreground">...</span>
          )}

          {/* Streaming indicator */}
          {isStreaming && (
            <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
              <div className="flex gap-1">
                <div
                  className="w-1 h-1 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1 h-1 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1 h-1 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}

          {/* Copy button */}
          {message.content && !isStreaming && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                isUser
                  ? "bg-primary-foreground text-primary hover:bg-primary-foreground/80"
                  : "bg-background text-muted-foreground hover:bg-accent"
              )}
              onClick={handleCopy}
              title="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-4 w-4 text-secondary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
