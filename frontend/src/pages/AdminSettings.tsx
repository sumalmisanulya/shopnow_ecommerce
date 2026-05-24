import { useEffect, useState } from "react";
import { useToastStore } from "@/store/useToastStore";
import { 
  Store, 
  DollarSign, 
  ShieldAlert, 
  Save, 
  Clock,
  RotateCcw
} from "lucide-react";

interface ShopSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  taxRate: number;
  freeShippingThreshold: number;
  sandboxMode: boolean;
  maintenanceMode: boolean;
}

const DEFAULT_SETTINGS: ShopSettings = {
  storeName: "ShopNow Inc.",
  supportEmail: "support@shopnow.com",
  supportPhone: "+1 (555) 019-2834",
  taxRate: 8,
  freeShippingThreshold: 100,
  sandboxMode: true,
  maintenanceMode: false
};

export default function AdminSettingsPage() {
  const showToast = useToastStore((state) => state.showToast);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    const localSettings = localStorage.getItem("mock_settings");
    if (localSettings) {
      setSettings(JSON.parse(localSettings));
    } else {
      localStorage.setItem("mock_settings", JSON.stringify(DEFAULT_SETTINGS));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      localStorage.setItem("mock_settings", JSON.stringify(settings));
      setIsSaving(false);
      showToast("Shop configurations updated successfully!", "success");
    }, 800);
  };

  const handleReset = () => {
    if (confirm("Reset settings back to defaults?")) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem("mock_settings", JSON.stringify(DEFAULT_SETTINGS));
      showToast("Settings reset to defaults.", "info");
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
    <div className="space-y-8 animate-slide-in text-left">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 font-sans">Shop Settings</h1>
        <p className="text-sm text-zinc-500 mt-1 font-sans">Configure global store attributes, checkout taxes, shipping limits, and developers mode.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left font-sans">
        {/* Left Column: Config Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Config Card */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-bold text-zinc-200 flex items-center gap-2 border-b border-white/5 pb-3">
              <Store className="w-4.5 h-4.5 text-violet-400" /> General Shop Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Store Public Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Support Contact Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Support Telephone
                </label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing Config Card */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-bold text-zinc-200 flex items-center gap-2 border-b border-white/5 pb-3">
              <DollarSign className="w-4.5 h-4.5 text-violet-400" /> Financial & Logistics Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Checkout Sales Tax (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Free Shipping Minimum Threshold ($)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Switches & Form Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-5">
            <h3 className="font-bold text-zinc-200 flex items-center gap-2 border-b border-white/5 pb-3">
              <ShieldAlert className="w-4.5 h-4.5 text-violet-400" /> Operational Controls
            </h3>

            {/* Sandbox Toggle */}
            <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
              <div>
                <p className="text-xs font-bold text-zinc-300">Sandbox Environment</p>
                <p className="text-[10px] text-zinc-500 mt-1">Run in localStorage mock-DB mode.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, sandboxMode: !settings.sandboxMode })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.sandboxMode ? "bg-violet-600" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.sandboxMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Maintenance Toggle */}
            <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
              <div>
                <p className="text-xs font-bold text-zinc-300">Maintenance Mode</p>
                <p className="text-[10px] text-zinc-500 mt-1">Lock down client checkout routes.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.maintenanceMode ? "bg-rose-600" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.maintenanceMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-white text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer text-sm shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Configuration"}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-300 border border-white/5 transition-colors cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
