"use client";

import { useEffect, useState, useMemo } from "react";
import { staffApi } from "@/lib/staff-api";
import { Modal } from "@/components/Modal";
import { useFeedback } from "@/components/FeedbackProvider";
import { CatalogHistoryTabs } from "@/components/CatalogHistoryTabs";
import { LiveStatusToggle } from "@/components/LiveStatusToggle";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Layers,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface MembershipTier {
  id: string;
  name: string;
  slug: string;
  tier_type: "MONTHLY" | "PACKAGE" | "DROP_IN";
  price: number;
  offer_price: number | null;
  currency: string;
  validity_days: number;
  total_classes: number | null;
  description: string | null;
  is_active: boolean;
  deleted_at?: string | null;
  attached_class_ids: string[];
  attached_classes: { id: string; name: string }[];
}

interface StudioClass {
  id: string;
  name: string;
  capacity?: number;
  duration_minutes?: number;
  is_active?: boolean;
  instructors?: { id: string; full_name: string }[];
}

function AttachedClassesDropdown({ classes }: { classes: { id: string; name: string }[] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#133623] hover:text-[#0C2417] bg-[#E8F0E9]/80 hover:bg-[#E8F0E9] px-2 py-0.5 rounded-md transition"
        aria-expanded={expanded}
      >
        <span>{expanded ? "Show fewer classes" : `+${classes.length} more classes`}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-2 p-2 bg-[#F9FAF9] border border-[#CEDECF] rounded-xl max-h-40 overflow-y-auto space-y-1">
          <p className="text-[10px] text-slate-500 font-medium px-0.5 mb-1">
            Additional {classes.length} included classes:
          </p>
          <div className="flex flex-wrap gap-1">
            {classes.map((cls) => (
              <span
                key={cls.id}
                className="text-[10px] bg-white border border-[#CEDECF] text-[#1b4332] px-2 py-0.5 rounded-md font-medium"
              >
                {cls.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StudioMembershipsProps {
  orgId?: string;
  canManageMemberships?: boolean;
}

export function StudioMemberships({ orgId, canManageMemberships = true }: StudioMembershipsProps) {
  const [org, setOrg] = useState(orgId || "");
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [historyItems, setHistoryItems] = useState<MembershipTier[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [membershipsPage, setMembershipsPage] = useState(1);
  const [membershipsPageSize, setMembershipsPageSize] = useState(9);
  const displayedItems = showHistory ? historyItems : tiers;
  const [classes, setClasses] = useState<StudioClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { notify, confirm } = useFeedback();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingTierId, setTogglingTierId] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [name, setName] = useState("");
  const [tierType, setTierType] = useState<"MONTHLY" | "PACKAGE" | "DROP_IN">("MONTHLY");
  const [price, setPrice] = useState("2500");
  const [offerPrice, setOfferPrice] = useState("");
  const [validityDays, setValidityDays] = useState("30");
  const [totalClasses, setTotalClasses] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [classFilter, setClassFilter] = useState("");

  const refreshTiers = async (orgId: string) => {
    try {
      const [current, history] = await Promise.all([
        staffApi(`/organizations/${orgId}/membership-tiers`),
        staffApi(`/organizations/${orgId}/membership-tiers?history=true`),
      ]);
      setTiers(current);
      setHistoryItems(history);
    } catch (e: any) {
      console.warn("Could not fetch membership tiers", e);
    }
  };

  const refreshClasses = async (orgId: string) => {
    try {
      const data = await staffApi(`/organizations/${orgId}/classes`);
      setClasses(data);
    } catch (e: any) {
      console.warn("Could not fetch classes", e);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let activeOrgId = orgId || org;
        if (!activeOrgId) {
          const context = await staffApi("/auth/context");
          activeOrgId = context.organization_id;
        }
        setOrg(activeOrgId);
        await Promise.all([
          refreshTiers(activeOrgId),
          refreshClasses(activeOrgId),
        ]);
      } catch (err) {
        notify((err as Error).message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [orgId, notify]);

  useEffect(() => {
    setMembershipsPage(1);
  }, [showHistory]);

  const resetForm = () => {
    setEditingTier(null);
    setName("");
    setTierType("MONTHLY");
    setPrice("2500");
    setOfferPrice("");
    setValidityDays("30");
    setTotalClasses("");
    setDescription("");
    setIsActive(true);
    setSelectedClassIds([]);
    setClassFilter("");
  };

  const openCreateModal = () => {
    void refreshClasses(org);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (tier: MembershipTier) => {
    void refreshClasses(org);
    setEditingTier(tier);
    setName(tier.name);
    setTierType(tier.tier_type);
    setPrice(String(tier.price));
    setOfferPrice(tier.offer_price != null ? String(tier.offer_price) : "");
    setValidityDays(String(tier.validity_days));
    setTotalClasses(tier.total_classes !== null ? String(tier.total_classes) : "");
    setDescription(tier.description || "");
    setIsActive(tier.is_active);
    setSelectedClassIds(tier.attached_class_ids || []);
    setClassFilter("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canManageMemberships || deletingId) return;
    const approved = await confirm({
      title: "Delete membership?",
      description: `Delete "${name}"? It will be removed from your catalog. Existing purchases and attendance history will be kept.`,
      confirmLabel: "Delete membership",
      destructive: true,
    });
    if (!approved) return;
    setDeletingId(id);
    try {
      await staffApi(`/organizations/${org}/membership-tiers/${id}`, { method: "DELETE" });
      await refreshTiers(org);
      notify("Membership deleted.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not delete membership.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (tierId: string, currentActive: boolean) => {
    setTogglingTierId(tierId);
    try {
      const res = await staffApi(`/organizations/${org}/membership-tiers/${tierId}/toggle-status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !currentActive }),
      });
      setTiers((prev) =>
        prev.map((t) => (t.id === tierId ? { ...t, is_active: res.is_active } : t))
      );
      notify(
        res.is_active
          ? "Your membership is live."
          : "Your membership is not live.",
        "success"
      );
    } catch (err: any) {
      notify(err.message || "Failed to update membership status", "error");
    } finally {
      setTogglingTierId(null);
    }
  };

  const handleToggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleSelectAllClasses = () => {
    setSelectedClassIds(classes.map((c) => c.id));
  };

  const handleDeselectAllClasses = () => {
    setSelectedClassIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(Number(price)) || Number(price) < 0 ||
        (offerPrice !== "" && (!Number.isFinite(Number(offerPrice)) || Number(offerPrice) < 0 || Number(offerPrice) > Number(price)))) {
      notify("Offer price must be between zero and the regular price.", "error");
      return;
    }
    setBusy(true);

    try {
      const payload = {
        name,
        tier_type: tierType,
        price: Number(price),
        offer_price: offerPrice === "" ? null : Number(offerPrice),
        currency: "INR",
        validity_days: Number(validityDays) || 30,
        total_classes:
          tierType === "PACKAGE" || tierType === "DROP_IN"
            ? Number(totalClasses) || 1
            : totalClasses ? Number(totalClasses) : null,
        description: description.trim() || null,
        is_active: isActive,
        class_ids: selectedClassIds,
      };

      if (editingTier) {
        await staffApi(`/organizations/${org}/membership-tiers/${editingTier.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        notify("🌿 Membership tier updated successfully.", "success");
      } else {
        await staffApi(`/organizations/${org}/membership-tiers`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify("🌿 New membership pass created successfully.", "success");
      }

      setShowHistory(false);
      setIsModalOpen(false);
      resetForm();
      await refreshTiers(org);
    } catch (err: any) {
      notify(err.message || "Failed to save membership tier", "error");
    } finally {
      setBusy(false);
    }
  };

  const filteredClasses = useMemo(() => {
    if (!classFilter.trim()) return classes;
    const q = classFilter.toLowerCase();
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.instructors?.some((i) => i.full_name.toLowerCase().includes(q))
    );
  }, [classes, classFilter]);

  const tierTypeBadge = (type: string) => {
    switch (type) {
      case "MONTHLY":
        return { label: "Monthly Pass", bg: "bg-[#E8F0E9] text-[#1b4332]" };
      case "PACKAGE":
        return { label: "Class Package", bg: "bg-blue-50 text-blue-900 border border-blue-200" };
      case "DROP_IN":
        return { label: "Drop-in Pass", bg: "bg-amber-50 text-amber-900 border border-amber-200" };
      default:
        return { label: type, bg: "bg-slate-100 text-slate-700" };
    }
  };

  return (
    <section className="space-y-6">
      {/* HEADER SECTION WITH TOP-RIGHT ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Memberships & Class Passes</h1>
          <p className="text-xs text-[#40514E] mt-0.5">
            Prepaid plans, credit packages, and rolling monthly access configurations.
          </p>
        </div>

        {canManageMemberships && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Membership Tier</span>
          </button>
        )}
      </div>



      <CatalogHistoryTabs history={showHistory} onChange={setShowHistory} label="Memberships" panelId="membership-catalog" />
      {/* MEMBERSHIP TIERS GRID (MAIN CONTENT VIEW) */}
      <div id="membership-catalog" role="tabpanel" aria-labelledby={`membership-catalog-${showHistory ? "history" : "current"}`} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-[#0C2417]">{showHistory ? "Deleted memberships" : "All Plans & Passes"}</h2>
          <span className="text-xs text-slate-500 font-medium">
            {displayedItems.length} {displayedItems.length === 1 ? "membership tier" : "membership tiers"} {showHistory ? "in history" : "configured"}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading membership passes…</div>
        ) : !displayedItems.length ? (
          <div className="p-8 bg-white rounded-3xl border border-[#CEDECF] text-center text-slate-500 text-sm space-y-2">
            <p className="font-semibold text-[#0C2417]">{showHistory ? "No deleted memberships yet." : "No membership tiers created yet."}</p>
            <p className="text-xs text-slate-400">
              {showHistory ? "Deleted memberships will appear here. Memberships that are not live stay in Current." : "Create a membership tier to start selling monthly passes or credit packages."}
            </p>
          </div>
        ) : (
          (() => {
            const totalMembershipPages = Math.max(1, Math.ceil(displayedItems.length / membershipsPageSize));
            const currentMembershipPage = Math.min(membershipsPage, totalMembershipPages);
            const paginatedMemberships = displayedItems.slice(
              (currentMembershipPage - 1) * membershipsPageSize,
              currentMembershipPage * membershipsPageSize
            );

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedMemberships.map((tier) => {
                    const badge = tierTypeBadge(tier.tier_type);
                    const isLive = tier.is_active;

                    return (
                      <article
                        key={tier.id}
                        className="bg-white px-5 py-4 rounded-3xl border border-[#E1E9E2] shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${badge.bg}`}>
                              {badge.label}
                            </span>
                            {showHistory ? (
                              <span className="record-capsule rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">Deleted</span>
                            ) : (
                              <LiveStatusToggle
                              live={isLive}
                              name={tier.name}
                              disabled={!canManageMemberships || togglingTierId === tier.id || deletingId === tier.id}
                              onChange={() => void handleToggleStatus(tier.id, isLive)}
                            />
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-[#0C2417] leading-tight">{tier.name}</h3>

                          <div>
                            {tier.offer_price != null && tier.offer_price < tier.price && <p className="text-sm text-slate-500"><span className="line-through">₹{tier.price.toLocaleString()}</span> <span className="ml-2 text-emerald-800">Offer price</span></p>}
                            <p className="text-3xl font-black text-[#0C2417]">
                              ₹{(tier.offer_price ?? tier.price).toLocaleString()}{" "}
                              <span className="text-xs font-normal text-slate-500">
                                {tier.tier_type === "MONTHLY"
                                  ? `/ ${tier.validity_days} Days`
                                  : tier.tier_type === "DROP_IN"
                                  ? "/ Drop-in"
                                  : `/ ${tier.validity_days} Days`}
                              </span>
                            </p>
                            {tier.total_classes !== null && tier.total_classes > 0 && (
                              <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                                {tier.total_classes} {tier.total_classes === 1 ? "credit" : "credits"} included
                              </p>
                            )}
                          </div>

                          {tier.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">{tier.description}</p>
                          )}

                          {/* ATTACHED CLASSES DISPLAY */}
                          <div className="border-t border-[#E1E9E2] pt-3 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-700 flex items-center gap-1">
                                <Layers className="h-3 w-3 text-[#133623]" /> Included Classes:
                              </span>
                              <span className="text-slate-500">
                                {tier.attached_classes?.length || 0} attached
                              </span>
                            </div>

                            {tier.attached_classes && tier.attached_classes.length > 0 ? (
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap gap-1">
                                  {tier.attached_classes.slice(0, 3).map((cls) => (
                                    <span
                                      key={cls.id}
                                      className="text-[11px] bg-[#E8F0E9] text-[#1b4332] px-2 py-0.5 rounded-md font-medium"
                                    >
                                      {cls.name}
                                    </span>
                                  ))}
                                </div>
                                {tier.attached_classes.length > 3 && (
                                  <AttachedClassesDropdown classes={tier.attached_classes.slice(3)} />
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">
                                All Studio Classes (General Access)
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Membership status and edit controls */}
                        <div className={`pt-3 border-t border-[#E1E9E2] items-center justify-end gap-2 ${showHistory ? "hidden" : "flex"}`}>
                          {!showHistory && canManageMemberships && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(tier)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#CEDECF] text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition"
                              >
                                <Pencil className="h-3.5 w-3.5 text-[#133623]" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete ${tier.name}`}
                                title="Delete membership"
                                disabled={deletingId === tier.id}
                                onClick={() => void handleDelete(tier.id, tier.name)}
                                className="btn-compact inline-flex items-center justify-center rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                                style={{ width: 30, height: 30, minHeight: 30, color: "#dc2626" }}
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </>
                          )}
                        </div>
                        {showHistory && tier.deleted_at && <p className="text-xs text-slate-500">Deleted {new Date(tier.deleted_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>}
                      </article>
                    );
                  })}
                </div>

                {displayedItems.length > 0 && (
                  <div className="mt-4 px-6 py-4 bg-[#FAF7F2] rounded-2xl border border-[#CEDECF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span>
                        Showing <strong>{(currentMembershipPage - 1) * membershipsPageSize + 1}</strong> to{" "}
                        <strong>{Math.min(currentMembershipPage * membershipsPageSize, displayedItems.length)}</strong> of <strong>{displayedItems.length}</strong> {showHistory ? "deleted passes" : "passes"}
                      </span>

                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-slate-400">Rows:</span>
                        <select
                          value={membershipsPageSize}
                          onChange={(e) => {
                            setMembershipsPageSize(Number(e.target.value));
                            setMembershipsPage(1);
                          }}
                          className="px-2 py-1 rounded-lg border border-[#CEDECF] bg-white font-medium text-[#0C2417]"
                        >
                          <option value={6}>6</option>
                          <option value={9}>9</option>
                          <option value={12}>12</option>
                          <option value={24}>24</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setMembershipsPage((p) => Math.max(1, p - 1))}
                        disabled={currentMembershipPage <= 1}
                        className="px-2.5 py-1.5 rounded-lg border border-[#CEDECF] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1 font-medium"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Prev</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {(() => {
                          const getPages = () => {
                            if (totalMembershipPages <= 7) {
                              return Array.from({ length: totalMembershipPages }, (_, i) => i + 1);
                            }
                            if (currentMembershipPage <= 4) {
                              return [1, 2, 3, 4, 5, "...", totalMembershipPages];
                            }
                            if (currentMembershipPage >= totalMembershipPages - 3) {
                              return [1, "...", totalMembershipPages - 4, totalMembershipPages - 3, totalMembershipPages - 2, totalMembershipPages - 1, totalMembershipPages];
                            }
                            return [1, "...", currentMembershipPage - 1, currentMembershipPage, currentMembershipPage + 1, "...", totalMembershipPages];
                          };

                          return getPages().map((pageNum, idx) =>
                            pageNum === "..." ? (
                              <span key={`dots-${idx}`} className="px-1 text-slate-400 font-bold select-none text-xs">
                                …
                              </span>
                            ) : (
                              <button
                                key={pageNum}
                                onClick={() => setMembershipsPage(Number(pageNum))}
                                className={`min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs transition ${
                                  currentMembershipPage === pageNum
                                    ? "bg-[#133623] text-white shadow-sm"
                                    : "bg-white border border-[#CEDECF] text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          );
                        })()}
                      </div>

                      <button
                        onClick={() => setMembershipsPage((p) => Math.min(totalMembershipPages, p + 1))}
                        disabled={currentMembershipPage >= totalMembershipPages}
                        className="px-2.5 py-1.5 rounded-lg border border-[#CEDECF] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1 font-medium"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()
        )}
      </div>

      {/* CREATE / EDIT MEMBERSHIP TIER POP-UP MODAL */}
      {isModalOpen && (
        <Modal
          title={editingTier ? "Edit Membership Tier" : "Create Membership Tier"}
          subtitle="Configure pricing, credit rules, live status, and attach included class batches."
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          confirmDiscard
        >
          <div className="p-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold">Membership status</p>
                <LiveStatusToggle live={isActive} onChange={setIsActive} name="Membership status" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <label className="font-semibold text-slate-700 sm:col-span-2">
                  Plan / Pass Name *
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Morning Hatha Unlimited, 10-Class Aerial Pack"
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700 sm:col-span-2">
                  Plan Type *
                  <select
                    value={tierType}
                    onChange={(e) => setTierType(e.target.value as any)}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  >
                    <option value="MONTHLY">Monthly Pass (Rolling Access)</option>
                    <option value="PACKAGE">Class Credit Package</option>
                    <option value="DROP_IN">Drop-in Single Pass</option>
                  </select>
                </label>

                <label className="font-semibold text-slate-700">
                  Price (₹) *
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700">
                  Offer Price (₹) (Optional)
                  <input
                    type="number"
                    min="0"
                    max={price || "0"}
                    step="0.01"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="Leave blank for regular price"
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                  <span className="mt-1 block text-[11px] font-normal text-slate-500">Must not exceed the regular price. Clear to remove the offer.</span>
                </label>

                <label className="font-semibold text-slate-700">
                  Validity Period (Days) *
                  <input
                    required
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700">
                  Total Class Credits {tierType === "PACKAGE" ? "*" : "(Optional for Monthly)"}
                  <input
                    type="number"
                    min="1"
                    required={tierType === "PACKAGE"}
                    placeholder={tierType === "MONTHLY" ? "Unlimited (Leave blank)" : "e.g. 10"}
                    value={totalClasses}
                    onChange={(e) => setTotalClasses(e.target.value)}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700 sm:col-span-2">
                  Description / Features
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Access to morning sessions with high-speed Zoom unlock and attendance recording."
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>
              </div>

              {/* ATTACH CLASSES CHECKLIST SECTION */}
              <div className="space-y-2 pt-2 border-t border-[#E1E9E2]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-[#0C2417] block">
                      Attach Included Classes ({selectedClassIds.length} selected)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Select which studio classes can be booked using this membership or pass.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllClasses}
                      className="text-[11px] text-[#133623] font-semibold hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllClasses}
                      className="text-[11px] text-slate-500 font-semibold hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {classes.length > 5 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search classes to attach…"
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs placeholder:text-xs placeholder:text-slate-400 rounded-xl border border-[#CEDECF] bg-[#F9FAF9] focus:outline-none focus:ring-1 focus:ring-[#133623]"
                    />
                  </div>
                )}

                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-[#F9FAF9] border border-[#CEDECF] rounded-2xl">
                  {!classes.length ? (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No classes found. You can still save this tier and attach classes later.
                    </p>
                  ) : !filteredClasses.length ? (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No classes match &ldquo;{classFilter}&rdquo;
                    </p>
                  ) : (
                    filteredClasses.map((cls) => {
                      const isChecked = selectedClassIds.includes(cls.id);
                      return (
                        <label
                          key={cls.id}
                          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
                            isChecked
                              ? "bg-white border-[#133623] shadow-xs"
                              : "bg-white/60 border-transparent hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleClass(cls.id)}
                              className="rounded text-[#133623] focus:ring-[#133623] h-4 w-4"
                            />
                            <div>
                              <p className="text-xs font-bold text-[#0C2417]">{cls.name}</p>
                              {cls.instructors && cls.instructors.length > 0 && (
                                <p className="text-[10px] text-slate-500">
                                  Guide: {cls.instructors.map((i) => i.full_name).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="self-start flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{cls.is_active ? "Active" : "Inactive"}</span>
                            {isChecked && <span className="text-[10px] font-bold text-[#1b4332]">Attached</span>}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* MODAL ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E1E9E2]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-[#133623] hover:bg-[#0C2417] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  {busy ? "Saving…" : editingTier ? "Update Membership Tier" : "Save Membership Tier"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </section>
  );
}
