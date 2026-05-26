import { useEffect, useState } from "react";
import { useToastStore } from "@/store/useToastStore";
import { 
  Mail, 
  User, 
  Search, 
  Trash2, 
  CheckSquare, 
  Square,
  MessageSquare,
  Clock,
  Calendar
} from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  replied?: boolean;
}

export default function AdminMessagesPage() {
  const showToast = useToastStore((state) => state.showToast);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const localMessages = JSON.parse(localStorage.getItem("mock_messages") || "[]");
    setMessages(localMessages);
  }, []);

  const saveMessages = (updatedMessages: Message[]) => {
    setMessages(updatedMessages);
    localStorage.setItem("mock_messages", JSON.stringify(updatedMessages));
  };

  const handleToggleReplied = (id: string) => {
    const updated = messages.map((m) => {
      if (m.id === id) {
        const nextState = !m.replied;
        showToast(
          nextState ? "Ticket marked as resolved/replied." : "Ticket marked as open.",
          "info"
        );
        return { ...m, replied: nextState };
      }
      return m;
    });
    saveMessages(updated);
  };

  const handleDeleteMessage = (id: string) => {
    if (confirm("Are you sure you want to delete this contact ticket?")) {
      const updated = messages.filter((m) => m.id !== id);
      saveMessages(updated);
      showToast("Ticket deleted from logs.", "info");
    }
  };

  const filteredMessages = messages.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query)
    );
  });

  const openTickets = messages.filter((m) => !m.replied).length;

  if (!mounted) {
    return (
      <div className="flex justify-center py-20">
        <Clock className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 font-sans">Customer Inquiries</h1>
          <p className="text-sm text-zinc-500 mt-1 font-sans">Audit guest feedback, support inquiries, and customer contact forms.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950/40 border border-white/5 px-4 py-2 rounded-xl">
          <MessageSquare className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-bold text-zinc-300 font-sans">
            {openTickets} active tickets
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by sender name, email, or message keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Messages Grid */}
      {filteredMessages.length === 0 ? (
        <div className="glass p-12 rounded-2xl border border-white/5 text-center text-zinc-500 text-sm font-sans">
          <Mail className="w-10 h-10 text-zinc-655 mx-auto mb-3" />
          No inquiries logged in mock data store.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left font-sans">
          {filteredMessages.map((ticket) => (
            <div 
              key={ticket.id} 
              className={`glass p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-6 ${
                ticket.replied 
                  ? "border-white/5 bg-white/[0.01] opacity-70" 
                  : "border-violet-500/10 bg-white/[0.03]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-zinc-200 flex items-center gap-1.5 text-sm">
                      <User className="w-4 h-4 text-zinc-500" /> {ticket.name}
                    </h3>
                    <p className="text-xs text-violet-400 font-mono mt-0.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {ticket.email}
                    </p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                    ticket.replied 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse-subtle"
                  }`}>
                    {ticket.replied ? "Resolved" : "Open"}
                  </span>
                </div>

                <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                  {ticket.message}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleReplied(ticket.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      ticket.replied 
                        ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-750" 
                        : "bg-violet-600/10 border-violet-500/20 text-violet-300 hover:bg-violet-600/20"
                    }`}
                  >
                    {ticket.replied ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" /> Open Ticket
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" /> Resolve Ticket
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(ticket.id)}
                    className="p-1.5 rounded hover:bg-rose-500/5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
