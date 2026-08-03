import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Newspaper,
  Layers,
  AlignJustify,
  Languages,
  Megaphone,
  FormInput,
  Send,
  Lock,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AddOnSliderPanel from "@/components/calculator/AddOnSliderPanel";
import LanguagePanel from "@/components/calculator/LanguagePanel";

const ADDONS = [
  { id: "blog", title: "Blog Section", desc: "Full blog/news publishing workflow", price: 200, Icon: Newspaper },
  { id: "customPostType", title: "Custom Post Type", desc: "Custom content types & templates", Icon: Layers, panelType: "slider", unitPrice: 150, sliderLabel: "Custom post types", sliderMax: 10 },
  { id: "megaMenu", title: "Mega Menu", desc: "Multi-level navigation menu", Icon: AlignJustify, panelType: "slider", unitPrice: 50, sliderLabel: "Mega menus", sliderMax: 10 },
  { id: "multiLanguage", title: "Multi Language", desc: "Multi language support", Icon: Languages, panelType: "language" },
  { id: "popUpCall", title: "Pop Up Call", desc: "Call to action pop ups", Icon: Megaphone, panelType: "slider", unitPrice: 10, sliderLabel: "Pop-up calls", sliderMax: 10 },
  { id: "form", title: "Form", desc: "Advanced forms with validation", Icon: FormInput, panelType: "slider", comingSoon: true },
  { id: "emailSubscription", title: "Email Subscription System", desc: "Newsletter & email list management", price: 120, Icon: Send, badge: "250 subscribers" },
];

const OPTION_KEYS = {
  customPostType: "cptCount",
  megaMenu: "megaMenuCount",
  popUpCall: "popUpCount",
};

export default function AddOnsSection({ addOns = {}, onChange, options, setOptions, pages }) {
  const updateOption = (key, value) => setOptions({ ...options, [key]: value });

  const renderPanel = (addon) => {
    if (addon.panelType === "slider") {
      const optionKey = OPTION_KEYS[addon.id];
      return (
        <AddOnSliderPanel
          count={options[optionKey]}
          onChange={(v) => updateOption(optionKey, v)}
          unitPrice={addon.unitPrice}
          max={addon.sliderMax}
          label={addon.sliderLabel}
        />
      );
    }
    if (addon.panelType === "language") {
      return (
        <LanguagePanel
          languages={options.languages}
          onChange={(langs) => updateOption("languages", langs)}
          pages={pages}
        />
      );
    }
    return null;
  };

  return (
    <section className="pt-10 border-t border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">04. Add-ons</h2>
      <p className="mt-1 text-sm text-slate-500">Enhance your website with additional features.</p>
      <div className="mt-5 space-y-3">
        {ADDONS.map((addon) => {
          const { id, title, desc, price, Icon, panelType, comingSoon, badge } = addon;
          const checked = !!addOns[id];
          const disabled = !!comingSoon;
          return (
            <div
              key={id}
              className={cn(
                "rounded-xl border-2 transition-all",
                checked ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
              )}
            >
              <div className="flex items-center gap-4 p-4">
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={(val) => onChange({ ...addOns, [id]: val })}
                />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900">{title}</p>
                    {badge && (
                      <Badge variant="secondary" className="font-normal">{badge}</Badge>
                    )}
                    {comingSoon && (
                      <Badge variant="outline" className="text-slate-400 border-slate-300">
                        <Lock className="h-3 w-3 mr-1" />Coming Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <div className="text-right shrink-0">
                  {price != null ? (
                    <p className="text-sm font-semibold text-slate-900">RM{price.toLocaleString()}</p>
                  ) : (
                    <p className="text-xs text-slate-400">Based on options</p>
                  )}
                </div>
              </div>
              <AnimatePresence initial={false}>
                {checked && panelType && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    {renderPanel(addon)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}