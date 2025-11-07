'use client'

import { MessageCircleIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from 'react-markdown';

interface ChatBotProps {
  data: string
}

interface Message {
  sender: "user" | "ai"
  text: string
}

export default function ChatBot({ data }: ChatBotProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  const toggleChat = () => setOpen(!open)
  const closeChat = () => setOpen(false)

  // Scroll otomatis ke bawah saat ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { sender: "user", text: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL_BE}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          descript: data
        })
      })

      if (!res.ok) {
        alert("Terjadi kesalahan saat menghubungi AI.")
        setLoading(false)
        return
      }

      const responseData = await res.json()
      console.log(responseData);
      const aiText = responseData?.result_msg || "AI tidak merespon."

      const aiMessage: Message = { sender: "ai", text: aiText }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan jaringan.")
    } finally {
      setLoading(false)
    }
  }

  // Kirim pesan dengan Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat Sidebar */}
      {open && (
        <div className="fixed bottom-20 right-5 w-80 h-[500px] bg-white shadow-lg rounded-lg flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold text-sm">AI Kidney Health Assistant</h3>
            <button
              className="text-white text-lg font-bold"
              onClick={closeChat}
            >
              ×
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-100">
            {messages.length === 0 && (
              <div className="flex items-start space-x-2">
                <div className="text-xl">🤖</div>
                <div className="bg-blue-200 text-black p-2 rounded-lg max-w-[70%]">
                  Hello! I’m your AI Kidney Health Assistant. How can I help you today?
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2 ${msg.sender === "user" ? "justify-end" : ""}`}
            >
                {msg.sender === "ai" && <div className="text-xl">🤖</div>}

                <div
                className={`p-2 rounded-lg max-w-[70%] whitespace-pre-line ${
                    msg.sender === "ai" ? "bg-blue-200 text-black" : "bg-green-200 text-black"
                }`}
                >
                <ReactMarkdown>
                    {msg.text}
                </ReactMarkdown>
                </div>

                {msg.sender === "user" && <div className="text-xl">🧑</div>}
            </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2 border-t border-gray-300">
            <input
              type="text"
              placeholder="Ask about stones, treatment, or prevention..."
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "..." : "➤"}
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        className="fixed bottom-5 right-5 w-12 h-12 bg-blue-600 text-white rounded-full flex justify-center items-center shadow-lg hover:bg-blue-700 transition-all z-50"
        onClick={toggleChat}
      >
        <MessageCircleIcon />
      </button>
    </>
  )
}
