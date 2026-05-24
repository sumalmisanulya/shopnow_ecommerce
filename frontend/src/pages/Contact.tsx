import { useState } from "react";
import { useToastStore } from "@/store/useToastStore";
import { Mail, MessageSquare, Phone, Send, Loader2 } from "lucide-react";

export default function ContactPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Save message in localstorage so the admin panel can list it!
      const mockMessages = JSON.parse(localStorage.getItem("mock_messages") || "[]");
      mockMessages.unshift({
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("mock_messages", JSON.stringify(mockMessages));

      showToast("Message sent successfully! Our team will contact you shortly.", "success");
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-violet-300 to-amber-300 bg-clip-text text-transparent">
          Get in Touch
        </h1>
        <p className="text-zinc-500 text-sm sm:text-base mt-3 max-w-md mx-auto">
          Have an inquiry, feedback, or need help? Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-bold text-zinc-200">Contact Details</h3>
            
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Mail className="w-5 h-5 text-violet-400 shrink-0" />
              <span>support@shopnow.com</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Phone className="w-5 h-5 text-violet-400 shrink-0" />
              <span>+1 (555) 019-2834</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <MessageSquare className="w-5 h-5 text-violet-400 shrink-0" />
              <span>Live chat available 9 AM - 5 PM EST</span>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="md:col-span-2">
          <div className="glass p-8 rounded-2xl border border-white/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4.5 h-4.5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
