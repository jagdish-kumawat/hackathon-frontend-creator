"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatStore } from "@/store/chat";
import { useAgents } from "@/hooks/use-agents";
import { ChatMessage } from "./chat-message";
import { ConversationSidebar } from "./conversation-sidebar";
import type { Conversation } from "@/lib/chat-api";

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { agents, loading: agentsLoading } = useAgents();
  const {
    currentConversation,
    conversations,
    isStreaming,
    isLoading,
    selectedAgentId,
    selectedAgentName,
    setSelectedAgent,
    loadConversations,
    startNewConversation,
    loadConversation,
    sendMessage,
    updateConversationTitle,
    deleteConversation,
    clearAllConversations,
    clearCurrentConversation,
  } = useChatStore();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  // Load conversations when agent is selected
  useEffect(() => {
    if (selectedAgentId) {
      loadConversations();
    }
  }, [selectedAgentId, loadConversations]);

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedAgentId || isStreaming) return;

    const messageToSend = message.trim();
    setMessage("");

    try {
      await sendMessage(messageToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAgentSelect = (agentId: string) => {
    const agent = agents?.items.find((a) => a.id === agentId);
    if (agent) {
      setSelectedAgent(agentId, agent.name);
      clearCurrentConversation();
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    loadConversation(conversation.id);
  };

  const handleNewChat = () => {
    startNewConversation();
  };

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Agent Chat</h1>
        <p className="text-muted-foreground mt-1">
          Have real-time conversations with your AI agents
        </p>
      </div>

      {/* Agent Selection */}
      <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-3">
          <Select
            value={selectedAgentId || ""}
            onValueChange={handleAgentSelect}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select an agent to chat with..." />
            </SelectTrigger>
            <SelectContent>
              {agentsLoading ? (
                <SelectItem value="loading" disabled>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading agents...
                </SelectItem>
              ) : agents?.items.length ? (
                agents.items.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span>{agent.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {agent.domain}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-agents" disabled>
                  No agents available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {selectedAgentId && (
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>
        {currentConversation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCurrentConversation}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Chat Area */}
      {selectedAgentId ? (
        <div className="flex-1 flex bg-card rounded-lg border overflow-hidden">
          {/* Conversation Sidebar */}
          <ConversationSidebar
            conversations={conversations}
            currentConversation={currentConversation}
            isLoading={isLoading}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewChat}
            onUpdateTitle={updateConversationTitle}
            onDeleteConversation={deleteConversation}
            onClearAll={clearAllConversations}
          />

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              {selectedAgentId ? (
                currentConversation &&
                currentConversation.messages.length > 0 ? (
                  <ScrollArea className="h-full px-6 py-4">
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {currentConversation.messages.map((msg, index) => (
                        <ChatMessage
                          key={`${msg.role}-${index}-${msg.timestamp}`}
                          message={msg}
                          agentName={selectedAgentName || "Agent"}
                          isStreaming={
                            isStreaming &&
                            msg.role === "assistant" &&
                            index === currentConversation.messages.length - 1
                          }
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <Card className="w-96 border-0 shadow-none">
                      <CardHeader className="text-center">
                        <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <CardTitle>Start a conversation</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center text-muted-foreground">
                        <p>
                          You&apos;re about to chat with{" "}
                          <span className="font-semibold text-foreground">
                            {selectedAgentName}
                          </span>
                        </p>
                        <p className="text-sm mt-2">
                          Type a message below to get started!
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <Card className="w-96 border-0 shadow-none">
                    <CardHeader className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <CardTitle>Welcome to Chat</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                      <p>
                        Select an agent from the dropdown above to start
                        chatting.
                      </p>
                      <p className="text-sm mt-2">
                        Your conversations will support real-time streaming
                        responses.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Input Area */}
            {selectedAgentId && (
              <div className="border-t px-6 py-4">
                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 relative">
                      <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                        className="min-h-[60px] max-h-32 resize-none pr-12"
                        disabled={isStreaming}
                      />
                      {isStreaming && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isStreaming}
                      size="lg"
                      className="shrink-0"
                    >
                      {isStreaming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {isStreaming && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {selectedAgentName} is typing...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-96 border-0 shadow-none">
            <CardHeader className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>Welcome to Chat</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Select an agent from the dropdown above to start chatting.</p>
              <p className="text-sm mt-2">
                Your conversations will support real-time streaming responses.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
