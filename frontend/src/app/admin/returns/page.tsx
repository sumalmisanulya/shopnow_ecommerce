"use client";

import { useEffect, useState } from "react";
import { useToastStore } from "@/store/useToastStore";
import { 
  RotateCcw, 
  Check, 
  X, 
  Search, 
  Mail, 
  Calendar, 
  Trash2, 
  Clock, 
  ClipboardList
} from "lucide-react";

interface ReturnRequest {
  id: string;
  orderCode: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  customerEmail: string;
  createdAt: string;
}

export default function AdminReturnsPage() {
  const showToast = useToastStore((state) => state.showToast);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const localReturns = JSON.parse(localStorage.getItem("mock_returns") || "[]");
    setReturns(localReturns);
  }, []);

  const saveReturns = (updatedReturns: ReturnRequest[]) => {
    setReturns(updatedReturns);
    localStorage.setItem("mock_returns", JSON.stringify(updatedReturns));
  };

  const handleUpdateStatus = (returnId: string, orderCode: string, newStatus: "APPROVED" | "REJECTED") => {
    const updated = returns.map((r) => {
      if (r.id === returnId) {
        return { ...r, status: newStatus };
      }
      return r;
    });
    saveReturns(updated);
    showToast(`Return request for ${orderCode} has been ${newStatus.toLowerCase()}!`, "success");
  };

  const handleDeleteReturn = (returnId: string) => {
    if (confirm("Are you sure you want to delete this return request log?")) {
      const updated = returns.filter((r) => r.id !== returnId);
      saveReturns(updated);
      showToast("Return request log deleted.", "info");
    }
  };

  const filteredReturns = returns.filter((r) => {
    const query = searchQuery.toLowerCase();
    return (
      r.orderCode.toLowerCase().includes(query) ||
      r.customerEmail.toLowerCase().includes(query) ||
      r.reason.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-455 border border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-550/20";
    }
  };

  if (!mounted) {
    return (
      <div className="flex justify-center py-20">
        <Clock className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100">Return Requests</h1>
          <p className="text-sm text-zinc-500 mt-1">Review refund claims, check product complaints, and authorize returns.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950/40 border border-white/5 px-4 py-2 rounded-xl">
          <RotateCcw className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-bold text-zinc-300">
            {returns.filter((r) => r.status === "PENDING").length} pending claims
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by order code, customer email, or claim reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Grid of claims */}
      {filteredReturns.length === 0 ? (
        <div className="glass p-12 rounded-2xl border border-white/5 text-center text-zinc-500 text-sm">
          <ClipboardList className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
          No return requests logged or matching search queries.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {filteredReturns.map((claim) => (
            <div 
              key={claim.id} 
              className="glass p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-violet-400 font-mono">ORDER #{claim.orderCode}</span>
                    <h3 className="text-xs text-zinc-500 mt-1 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {claim.customerEmail}
                    </h3>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(claim.status)}`}>
                    {claim.status}
                  </span>
                </div>

                <div className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl text-xs text-zinc-300 leading-relaxed italic">
                  &ldquo;{claim.reason}&rdquo;
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(claim.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>

                <div className="flex items-center gap-2">
                  {claim.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(claim.id, claim.orderCode, "APPROVED")}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(claim.id, claim.orderCode, "REJECTED")}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteReturn(claim.id)}
                    className="p-1.5 rounded hover:bg-rose-500/5 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Delete Request"
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
