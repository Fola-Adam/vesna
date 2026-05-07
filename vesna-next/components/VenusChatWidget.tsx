"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./VenusChatWidget.module.css";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
}

export default function VenusChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      content:
        "Welcome to Vesna. I'm Venus, your AI assistant. How can I help you discover exceptional objects today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && window.innerWidth < 768 && !isFullscreen) {
      setIsFullscreen(true);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addMessage(`Attached ${files.length} file(s)`, true);
    }
  };

  const handleAudioRecord = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      addMessage("Voice message sent", true);
    }
  };

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      content,
      isUser,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([...messages, newMessage]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addMessage(inputValue, true);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      addMessage(
        "I understand. Let me help you find the perfect piece for your collection.",
        false,
      );
    }, 1500);
  };

  return (
    <div className="fixed top-0 right-0 h-full z-50">
      {/* Edge Trigger */}
      <div
        onClick={toggleChat}
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-[6px] h-32 bg-secondary/20 hover:bg-secondary/40 cursor-pointer rounded-l-sm transition-colors ${
          isOpen ? "" : styles.edgePeek
        }`}
        style={{
          animation: isOpen ? "none" : "edgePeek 3s ease-in-out infinite",
        }}
      />

      {/* Slide-out Panel */}
      <div
        className={`absolute top-0 right-0 h-full bg-stone-950/98 backdrop-blur-2xl border-l-[0.5px] border-secondary/20 shadow-2xl transition-all duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${
          isFullscreen
            ? "w-full"
            : "w-[400px] sm:w-[450px] md:w-[500px] lg:w-[600px]"
        }`}
      >
        {/* Header */}
        <div className="bg-stone-950/50 border-b-[0.5px] border-secondary/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-secondary/10 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-secondary text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <div>
              <h3 className="font-button-label text-[10px] text-secondary uppercase tracking-[0.15em]">
                Venus AI
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="text-stone-600 hover:text-secondary transition-colors p-1"
            >
              <span className="material-symbols-outlined text-lg">
                {isFullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
            </button>
            <button
              onClick={toggleChat}
              className="text-stone-600 hover:text-secondary transition-colors p-1"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col gap-2 max-w-full ${styles.animateFadeIn} ${
                message.isUser ? "items-end" : ""
              }`}
            >
              {!message.isUser && (
                <div className="flex items-center gap-2">
                  <span className="w-0.5 h-0.5 bg-secondary rounded-full" />
                  <span className="font-button-label text-[8px] text-secondary tracking-widest uppercase">
                    Venus Intelligence
                  </span>
                </div>
              )}
              <div className={`${styles.glassPanel} border-[0.5px] border-secondary/10 px-4 py-3 rounded-sm`}>
                <p
                  className={`${
                    message.isUser
                      ? "font-body-main text-sm leading-relaxed text-on-surface-variant font-light"
                      : `${styles.fontVenusLight} text-base italic leading-relaxed text-on-surface`
                  }`}
                >
                  {message.content}
                </p>
              </div>
              {message.isUser && (
                <span className="font-button-label text-[8px] text-stone-600 tracking-widest uppercase">
                  {message.timestamp}
                </span>
              )}
            </div>
          ))}

          {isTyping && (
            <div className={`flex flex-col gap-2 max-w-full ${styles.animateFadeIn}`}>
              <div className="flex items-center gap-2">
                <span className="w-0.5 h-0.5 bg-secondary rounded-full" />
                <span className="font-button-label text-[8px] text-secondary tracking-widest uppercase">
                  Venus Intelligence
                </span>
              </div>
              <div className={`${styles.glassPanel} border-[0.5px] border-secondary/10 px-4 py-3 rounded-sm`}>
                <div className="flex gap-1.5">
                  <div className={`w-1.5 h-1.5 bg-secondary/60 rounded-full ${styles.typingDot}`} />
                  <div className={`w-1.5 h-1.5 bg-secondary/60 rounded-full ${styles.typingDot}`} />
                  <div className={`w-1.5 h-1.5 bg-secondary/60 rounded-full ${styles.typingDot}`} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t-[0.5px] border-secondary/10 p-5">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFileAttach}
                className="text-stone-600 hover:text-secondary transition-colors p-1"
              >
                <span className="material-symbols-outlined text-lg">
                  attach_file
                </span>
              </button>
              <button
                type="button"
                onClick={handleAudioRecord}
                className={`transition-colors p-1 ${
                  isRecording
                    ? "text-secondary"
                    : "text-stone-600 hover:text-secondary"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isRecording ? "stop" : "mic"}
                </span>
              </button>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe a mood or a silhouette..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-body-main placeholder:text-stone-600 text-sm font-light"
            />
            <button
              type="submit"
              className="flex items-center gap-2 text-secondary group"
            >
              <span className="font-button-label text-[9px] uppercase tracking-[0.15em] group-hover:text-secondary/80 transition-colors">
                Ask
              </span>
              <div className="w-7 h-7 rounded-full border-[0.5px] border-secondary/30 flex items-center justify-center group-hover:border-secondary group-hover:bg-secondary group-hover:text-stone-950 transition-all duration-300">
                <span className="material-symbols-outlined text-[14px]">
                  north_east
                </span>
              </div>
            </button>
          </form>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          <p className="text-[8px] text-stone-600 text-center mt-2 font-button-label tracking-wider uppercase">
            Powered by Oracle:Atlas
          </p>
        </div>
      </div>
    </div>
  );
}
