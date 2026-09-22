import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { FiMic, FiMicOff } from "react-icons/fi";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  FiPlus,
  FiLogOut,
  FiSend,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiZap,
  FiMoreHorizontal,
  FiUser,
} from "react-icons/fi";

function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const suggestionPrompts = [
    "Summarize this idea",
    "Help me debug code",
    "Give me a creative writing prompt",
    "Explain a complex topic simply",
  ];

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (transcript) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrompt(transcript);
    }
  }, [transcript]);

  const startListening = () => {
    resetTranscript();

    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [prompt]);

  const loadConversations = async () => {
    try {
      const response = await api.get("/conversation");
      setConversations(response.data);
    } catch {
      setConversations([]);
    }
  };

  const createConversation = () => {
    setMessages([]);
    setSelectedConversation(null);
    setPrompt("");

    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/${conversationId}`);
      setMessages(response.data);

      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);

    let conversationId = selectedConversation?.id;
    const currentPrompt = prompt.trim();

    try {
      if (!conversationId) {
        const title =
          currentPrompt.length > 34
            ? currentPrompt.substring(0, 34) + "..."
            : currentPrompt;

        const response = await api.post("/conversation", {
          title,
        });

        conversationId = response.data.id;
        setSelectedConversation(response.data);
        setConversations((prev) => [response.data, ...prev]);
      }

      setMessages((prev) => [
        ...prev,
        {
          userMessage: currentPrompt,
          aiResponse: "",
        },
      ]);

      setPrompt("");

      await api.post("/chat", {
        conversationId,
        prompt: currentPrompt,
      });

      await loadMessages(conversationId);
    } catch {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    const confirmDelete = window.confirm("Delete this chat?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/conversation/${conversationId}`);

      setConversations((prev) =>
        prev.filter((chat) => chat.id !== conversationId),
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch {
      alert("Delete failed");
    }
  };

  const saveConversationTitle = async (conversationId) => {
    const newTitle = editingTitle.trim();

    if (!newTitle) {
      setEditingConversationId(null);
      setEditingTitle("");
      return;
    }

    try {
      await api.put(`/conversation/${conversationId}`, {
        title: newTitle,
      });

      setConversations((prev) =>
        prev.map((chat) =>
          chat.id === conversationId
            ? {
                ...chat,
                title: newTitle,
              }
            : chat,
        ),
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                title: newTitle,
              }
            : prev,
        );
      }

      setEditingConversationId(null);
      setEditingTitle("");
    } catch {
      alert("Rename failed");
    }
  };

  const handleOpenConversation = (conv) => {
    if (editingConversationId === conv.id) return;

    setSelectedConversation(conv);
    loadMessages(conv.id);
    setOpenMenuId(null);
  };

  const handleEditConversation = (conv) => {
    setOpenMenuId(null);
    setEditingConversationId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleDeleteConversation = (conversationId) => {
    setOpenMenuId(null);
    deleteConversation(conversationId);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConversations();
  }, []);

  const dark = theme === "dark";
  const activeTitle = selectedConversation?.title || "New conversation";
  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser doesn't support Speech Recognition.</p>;
  }
  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-300 ${
        dark ? "bg-[#0b1020] text-white" : "bg-[#f3f5fb] text-slate-900"
      }`}
    >
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/45 z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:relative
          z-50
          top-0 left-0
          h-screen
          w-80
          border-r
          flex flex-col
          overflow-hidden
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${dark ? "border-white/10 bg-[#111827]" : "border-slate-200 bg-white"}
        `}
      >
        <div className="p-4">
          <button
            type="button"
            onClick={createConversation}
            className={`
              w-full
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              px-4
              py-3
              font-medium
              transition
              ${
                dark
                  ? "bg-sky-500/90 text-slate-950 hover:bg-sky-400"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }
            `}
          >
            <FiPlus />
            New Chat
          </button>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-3"
          onClick={() => setOpenMenuId(null)}
        >
          <div className="mb-3 px-2">
            <p
              className={`text-[11px] uppercase tracking-[0.24em] ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              Recent chats
            </p>
          </div>

          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`
                relative
                mb-2
                rounded-2xl
                border
                transition
                ${
                  selectedConversation?.id === conv.id
                    ? dark
                      ? "border-sky-400/40 bg-slate-800"
                      : "border-slate-300 bg-slate-100"
                    : dark
                      ? "border-transparent hover:border-white/10 hover:bg-white/4"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              <div className="flex items-center justify-between gap-3 px-3 py-3">
                {editingConversationId === conv.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveConversationTitle(conv.id);
                        }

                        if (e.key === "Escape") {
                          e.preventDefault();
                          setEditingConversationId(null);
                          setEditingTitle("");
                        }
                      }}
                      onBlur={() => saveConversationTitle(conv.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                        dark
                          ? "border-white/10 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-900"
                      }`}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenConversation(conv)}
                    className="flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium">{conv.title}</p>
                    <p
                      className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Tap to resume
                    </p>
                  </button>
                )}

                {editingConversationId !== conv.id && (
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`Open actions for ${conv.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((current) =>
                          current === conv.id ? null : conv.id,
                        );
                      }}
                      className={`rounded-xl p-2 transition ${
                        dark
                          ? "bg-white/5 text-slate-200 hover:bg-white/10"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <FiMoreHorizontal size={16} />
                    </button>

                    {openMenuId === conv.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute right-0 top-full z-20 mt-2 w-36 overflow-hidden rounded-2xl border shadow-lg ${
                          dark
                            ? "border-white/10 bg-[#111827]"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleEditConversation(conv)}
                          className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm ${
                            dark
                              ? "text-slate-100 hover:bg-white/5"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-amber-500">✎</span>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteConversation(conv.id)}
                          className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm ${
                            dark
                              ? "text-rose-300 hover:bg-white/5"
                              : "text-rose-500 hover:bg-rose-50"
                          }`}
                        >
                          <span>🗑</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto p-4">
          {localStorage.getItem("token") ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  dark
                    ? "border-white/10 bg-white/3 hover:bg-white/6"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    dark
                      ? "bg-sky-400 text-slate-950"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  <FiUser size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    Your profile
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Account settings
                  </span>
                </span>
                <FiMoreHorizontal
                  className={dark ? "text-slate-400" : "text-slate-500"}
                />
              </button>

              {profileOpen && (
                <div
                  className={`absolute bottom-full left-0 right-0 z-30 mb-2 overflow-hidden rounded-2xl border shadow-lg ${
                    dark
                      ? "border-white/10 bg-[#111827]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm ${
                      dark
                        ? "text-slate-100 hover:bg-white/5"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <FiUser size={14} />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm ${
                      dark
                        ? "text-rose-300 hover:bg-white/5"
                        : "text-rose-500 hover:bg-rose-50"
                    }`}
                  >
                    <FiLogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => (window.location.href = "/register")}
              className={`flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold ${
                dark ? "bg-white text-slate-950" : "bg-slate-900 text-white"
              }`}
            >
              Signup
            </button>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className={`
            sticky
            top-0
            z-30
            flex
            h-16
            shrink-0
            items-center
            justify-between
            border-b
            px-4
            backdrop-blur
            md:px-6
            ${
              dark
                ? "border-white/10 bg-[#0b1020]/90"
                : "border-slate-200 bg-white/90"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="rounded-xl p-2 text-xl md:hidden"
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`rounded-2xl p-2 ${
                  dark
                    ? "bg-sky-500/15 text-sky-300"
                    : "bg-slate-900 text-white"
                }`}
              >
                <FiZap />
              </div>
              <div>
                <p className="text-sm font-semibold">{activeTitle}</p>
                <p
                  className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Intelligent assistant
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            className={`rounded-xl p-2 transition ${
              dark
                ? "bg-white/5 hover:bg-white/10"
                : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            {dark ? <FiSun /> : <FiMoon />}
          </button>
        </header>

        <div
          className={`
            min-h-0
            flex-1
            overflow-y-auto
            scroll-smooth
            ${
              dark
                ? "bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_28%),#0b1020]"
                : "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_28%),#f3f5fb]"
            }
          `}
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 py-10">
              <div className="max-w-2xl text-center">
                <div
                  className={`mx-auto mb-4 inline-flex rounded-full p-3 ${
                    dark
                      ? "bg-sky-500/10 text-sky-300"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  <FiZap />
                </div>
                <h2 className="text-3xl font-semibold md:text-4xl">
                  How can I help you today?
                </h2>
                <p
                  className={`mt-3 text-sm md:text-base ${dark ? "text-slate-300" : "text-slate-600"}`}
                >
                  Ask anything — from quick explanations to full code
                  walkthroughs.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {suggestionPrompts.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPrompt(item)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        dark
                          ? "bg-white/6 text-slate-100 hover:bg-white/10"
                          : "bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
              <div className="space-y-8">
                {messages.map((msg, index) => (
                  <div key={index} className="space-y-6">
                    <div className="flex justify-end pl-8 md:pl-16">
                      <div
                        className={`max-w-[90%] rounded-3xl px-4 py-3 text-sm leading-7 md:max-w-[78%] md:px-5 md:text-[15px] ${
                          dark
                            ? "bg-slate-700/90 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                            : "bg-slate-900 text-white shadow-sm"
                        }`}
                      >
                        {msg.userMessage}
                      </div>
                    </div>

                    {msg.aiResponse ? (
                      <div className="flex gap-3 md:gap-4">
                        <span
                          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            dark
                              ? "bg-sky-400 text-slate-950"
                              : "bg-slate-900 text-white"
                          }`}
                        >
                          AI
                        </span>

                        <div className="min-w-0 flex-1 pt-0.5">
                          <p
                            className={`mb-2 text-xs font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}
                          >
                            Assistant
                          </p>
                          <div
                            className={`chat-markdown text-[15px] leading-7 md:text-base ${dark ? "chat-markdown-dark" : ""}`}
                          >
                            <ReactMarkdown
                              components={{
                                code({ inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(
                                    className || "",
                                  );

                                  return !inline && match ? (
                                    <div className="my-4 overflow-hidden rounded-xl">
                                      <SyntaxHighlighter
                                        style={dark ? oneDark : oneLight}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, "")}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code
                                      className={`rounded-md px-1.5 py-1 text-[13px] ${
                                        dark ? "bg-white/10" : "bg-slate-100"
                                      }`}
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {msg.aiResponse}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-400 text-xs font-bold text-slate-950">
                      AI
                    </span>
                    <div className={`inline-flex items-center gap-2 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-sky-400" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-sky-400 [animation-delay:0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-sky-400 [animation-delay:0.3s]" />
                      <span className="ml-1">Thinking</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        <div
          className={`shrink-0 border-t px-3 py-3 md:px-6 ${
            dark ? "border-white/10 bg-[#0b1020]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto max-w-5xl">
            <div
              className={`rounded-[28px] border px-4 py-3 ${
                dark
                  ? "border-white/10 bg-[#111827] shadow-[0_30px_60px_-25px_rgba(56,189,248,0.24)]"
                  : "border-slate-200 bg-white shadow-[0_30px_60px_-25px_rgba(15,23,42,0.1)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-1 rounded-[28px] border px-4 py-3 transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20 ${
                    dark
                      ? "border-white/10 bg-white/5"
                      : "border-slate-200 bg-slate-100"
                  }`}
                >
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask anything..."
                    className="min-h-[52px] max-h-40 w-full resize-none bg-transparent text-sm text-current placeholder:text-slate-500 outline-none transition md:text-[15px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={loading}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                    loading
                      ? "cursor-not-allowed bg-slate-300 text-slate-500"
                      : dark
                        ? "bg-sky-400 text-slate-950 hover:bg-sky-300"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <FiSend />
                </button>
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  disabled={loading}
                  title={listening ? "Stop listening" : "Start voice input"}
                  className={`relative rounded-2xl p-3 transition-all duration-200 ${
                    loading
                      ? "cursor-not-allowed bg-slate-300 text-slate-500"
                      : listening
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : dark
                          ? "bg-white/10 text-slate-200 hover:bg-white/20"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {listening && (
                    <span className="absolute inset-0 animate-ping rounded-2xl bg-red-400 opacity-30" />
                  )}

                  <span className="relative">
                    {listening ? <FiMicOff size={18} /> : <FiMic size={18} />}
                  </span>
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px]">
                <p className={dark ? "text-slate-400" : "text-slate-500"}>
                  Press Enter to send • Shift + Enter for newline
                </p>
                <p className={dark ? "text-slate-400" : "text-slate-500"}>
                  {prompt.length}/2000
                </p>
                {listening && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-red-500">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span>Listening...</span>
                    <span className="text-slate-400">Speak now</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Chat;
