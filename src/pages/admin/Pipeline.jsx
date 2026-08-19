import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AddDealForm from "@/components/pipeline/AddDealForm";
import DealsThisQuarter from "@/components/pipeline/DealsThisQuarter";
import StageDistribution from "@/components/pipeline/StageDistribution";
import KanbanBoard from "@/components/pipeline/KanbanBoard";
import LoadErrorBanner from "@/components/admin/LoadErrorBanner";

export default function Pipeline() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const data = await base44.entities.Deal.list();
        setDeals(data);
      } catch (e) {
        console.error("Failed to load deals", e);
        setLoadError(e?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    loadDeals();
  }, []);

  const handleAddDeal = async (deal) => {
    const created = await base44.entities.Deal.create(deal);
    setDeals((prev) => [...prev, created]);
  };

  const handleMoveDeal = async (dealId, newStage) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );
    await base44.entities.Deal.update(dealId, { stage: newStage });
  };

  const handleDeleteDeal = async (dealId) => {
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
    await base44.entities.Deal.delete(dealId);
  };

  const handleUpdateDeal = async (dealId, updates) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, ...updates } : d))
    );
    await base44.entities.Deal.update(dealId, updates);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadErrorBanner label="deals" error={loadError} />

      {/* Row 1: Add Deal Form + Deals This Quarter Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AddDealForm onAddDeal={handleAddDeal} />
        </div>
        <div className="lg:col-span-2">
          <DealsThisQuarter deals={deals} />
        </div>
      </div>

      {/* Row 2: Stage Distribution Chart */}
      <StageDistribution deals={deals} />

      {/* Row 3: Kanban Board */}
      <KanbanBoard deals={deals} onMoveDeal={handleMoveDeal} onDeleteDeal={handleDeleteDeal} onUpdateDeal={handleUpdateDeal} />
    </div>
  );
}
