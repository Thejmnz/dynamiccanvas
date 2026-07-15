"use client";

import { Fragment, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Users, FileCode, Key, Search, ChevronDown, ChevronUp, Mail,
  Calendar, Shield, Activity, Sparkles, Save, X, Plus, Trash2, Newspaper,
  MessageSquare, ArrowUp, ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useUserRole } from "@/hooks/use-user-role";
import { BrandLoading } from "@/components/brand-loading";
import { adminOverviewQueryKey, fetchAdminOverview } from "@/features/dashboard/api/dashboard-prefetch";

interface UserStats {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  image: string | null;
  createdAt: string | null;
  plan: string;
  creditsBalance: number;
  creditsPerMonth: number;
  renderCount: number;
  templatesCount: number;
  projectsCount: number;
  hasApiKey: boolean;
}

interface AdminStats {
  totalUsers: number;
  totalTemplates: number;
  totalRenders: number;
  totalApiKeys: number;
  usersThisMonth: number;
  templatesThisMonth: number;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  creator: "Creator",
  agency: "Agency",
  business: "Business",
  unlimited: "Unlimited",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  creator: "bg-blue-100 text-blue-700",
  agency: "bg-purple-100 text-purple-700",
  business: "bg-green-100 text-green-700",
  unlimited: "bg-amber-100 text-amber-700",
};

export default function AdminDashboard() {
  const { role, loading: roleLoading, isAuthenticated } = useUserRole();
  const router = useRouter();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserStats | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsBody, setNewsBody] = useState("");
  const [newsTag, setNewsTag] = useState("update");

  const {
    data: overview,
    isPending: loading,
    refetch,
  } = useQuery<{ users: UserStats[]; stats: AdminStats; news: any[]; feedback: any[] }>({
    queryKey: adminOverviewQueryKey,
    queryFn: fetchAdminOverview,
    enabled: !roleLoading && isAuthenticated && role === "superadmin",
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const usersList = overview?.users ?? [];
  const stats = overview?.stats ?? null;
  const newsList = overview?.news ?? [];
  const feedbackList = overview?.feedback ?? [];

  useEffect(() => {
    if (roleLoading) return;
    if (!isAuthenticated) { router.push("/sign-in"); return; }
    if (role !== "superadmin") { router.push("/dashboard"); return; }
  }, [role, roleLoading, isAuthenticated, router]);

  const filteredUsers = usersList.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          plan: editingUser.plan,
          creditsBalance: editingUser.creditsBalance,
          creditsPerMonth: editingUser.creditsPerMonth,
        }),
      });
      if (res.ok) {
        toast.success("User updated");
        setEditingUser(null);
        void refetch();
      } else {
        toast.error("Failed to update user");
      }
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleCreateNews = async () => {
    if (!newsTitle.trim() || !newsBody.trim()) return;
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newsTitle, body: newsBody, tag: newsTag }),
      });
      if (res.ok) {
        toast.success("News created");
        setNewsTitle(""); setNewsBody(""); setNewsTag("update");
        void refetch();
      }
    } catch { toast.error("Failed"); }
  };

  const handleDeleteNews = async (id: string) => {
    try {
      await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      void refetch();
    } catch { }
  };

  const handleFeedbackStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed");
      toast.success("Feedback status updated");
      void refetch();
    } catch {
      toast.error("Could not update feedback");
    }
  };

  if (loading) {
    return <BrandLoading label="" className="min-h-[70vh] border-0 bg-transparent" />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#5b35d5]" />
          Admin Panel
        </h1>
        <p className="text-[#101426]/55 mt-2">Manage users, plans and credits.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Users", value: stats.totalUsers, sub: `+${stats.usersThisMonth} this month`, icon: Users, color: "bg-[#e9e5ff]" },
            { label: "Templates", value: stats.totalTemplates, sub: `+${stats.templatesThisMonth} this month`, icon: FileCode, color: "bg-[#c9ff5a]" },
            { label: "Renders", value: stats.totalRenders, sub: "all time", icon: Activity, color: "bg-[#ffb7aa]" },
            { label: "API Keys", value: stats.totalApiKeys, sub: "active", icon: Key, color: "bg-[#d9ccff]" },
          ].map((s) => (
            <div key={s.label} className={`rounded-[18px] border-2 border-[#101426] p-4 ${s.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">{s.label}</span>
                <s.icon className="size-4" />
              </div>
              <div className="mt-3 text-3xl font-black">{s.value}</div>
              <div className="mt-1 text-[11px] font-semibold text-[#101426]/50">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-[22px] border-2 border-[#101426] bg-white overflow-hidden">
        <div className="p-4 border-b-2 border-[#101426]/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#101426]/30" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-[#101426]/15 rounded-xl focus:ring-2 focus:ring-[#5b35d5] focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#101426] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">Credits</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">Renders</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider">Templates</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101426]/8">
              {filteredUsers.map((user) => (
                <Fragment key={user.id}>
                  <tr
                    className="hover:bg-[#101426]/3 transition-colors cursor-pointer"
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-gradient-to-br from-[#5b35d5] to-[#c9ff5a] flex items-center justify-center text-white font-black text-sm">
                          {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{user.name || "—"}</div>
                          <div className="text-xs text-[#101426]/50 flex items-center gap-1">
                            <Mail className="size-3" />{user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-black rounded-full ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                        {PLAN_LABELS[user.plan] || user.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold">{user.creditsBalance.toLocaleString()}</div>
                      <div className="text-xs text-[#101426]/40">/ {user.creditsPerMonth === 999999999 ? "∞" : user.creditsPerMonth.toLocaleString()} per mo</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold">{user.renderCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold">{user.templatesCount}</td>
                    <td className="px-4 py-3">
                      {expandedUser === user.id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </td>
                  </tr>

                  {expandedUser === user.id && (
                    <tr className="bg-[#101426]/3">
                      <td colSpan={6} className="px-4 py-4">
                        {editingUser?.id === user.id ? (
                          <div className="flex flex-wrap items-end gap-4">
                            <div>
                              <label className="text-xs font-bold uppercase text-[#101426]/50 block mb-1">Plan</label>
                              <select
                                value={editingUser.plan}
                                onChange={(e) => {
                                  const newPlan = e.target.value;
                                  const planDefaults: Record<string, { balance: number; monthly: number }> = {
                                    free: { balance: 50, monthly: 0 },
                                    creator: { balance: 1000, monthly: 1000 },
                                    agency: { balance: 5000, monthly: 5000 },
                                    business: { balance: 25000, monthly: 25000 },
                                    unlimited: { balance: 999999999, monthly: 999999999 },
                                  };
                                  const d = planDefaults[newPlan] || planDefaults.free;
                                  setEditingUser({ ...editingUser, plan: newPlan, creditsBalance: d.balance, creditsPerMonth: d.monthly });
                                }}
                                className="border-2 border-[#101426]/15 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-[#5b35d5]"
                              >
                                <option value="free">Free (50 credits, 3 templates)</option>
                                <option value="creator">Creator (1,000 credits, 15 templates)</option>
                                <option value="agency">Agency (5,000 credits, 100 templates)</option>
                                <option value="business">Business (25,000 credits, ∞ templates)</option>
                                <option value="unlimited">Unlimited (∞ everything)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase text-[#101426]/50 block mb-1">Credits balance</label>
                              <input
                                type="number"
                                value={editingUser.creditsBalance}
                                onChange={(e) => setEditingUser({ ...editingUser, creditsBalance: Number(e.target.value) })}
                                className="border-2 border-[#101426]/15 rounded-xl px-3 py-2 text-sm font-bold w-32 focus:ring-2 focus:ring-[#5b35d5]"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase text-[#101426]/50 block mb-1">Credits / month</label>
                              <input
                                type="number"
                                value={editingUser.creditsPerMonth}
                                onChange={(e) => setEditingUser({ ...editingUser, creditsPerMonth: Number(e.target.value) })}
                                className="border-2 border-[#101426]/15 rounded-xl px-3 py-2 text-sm font-bold w-32 focus:ring-2 focus:ring-[#5b35d5]"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveUser}
                                className="flex items-center gap-1.5 rounded-full bg-[#c9ff5a] border-2 border-[#101426] px-4 py-2 text-sm font-black hover:bg-white transition"
                              >
                                <Save className="size-3.5" />Save
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="flex items-center gap-1.5 rounded-full bg-white border-2 border-[#101426]/20 px-4 py-2 text-sm font-black hover:bg-[#101426]/5 transition"
                              >
                                <X className="size-3.5" />Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="text-sm text-[#101426]/60">
                              <Calendar className="size-3.5 inline mr-1" />
                              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                              {user.hasApiKey && <span className="ml-3 text-green-600 font-bold">API Key active</span>}
                            </div>
                            <div className="flex gap-2 ml-auto">
                              <button
                                onClick={() => setEditingUser({ ...user })}
                                className="flex items-center gap-1.5 rounded-full bg-[#101426] text-white px-4 py-2 text-sm font-black hover:bg-[#5b35d5] transition"
                              >
                                <Sparkles className="size-3.5" />Edit plan & credits
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="size-10 text-[#101426]/30 mx-auto mb-3" />
              <p className="text-sm text-[#101426]/50">No users found.</p>
            </div>
          )}
        </div>
      </div>

      {/* News Management */}
      <div className="mt-6 rounded-[22px] border-2 border-[#101426] bg-white overflow-hidden">
        <div className="p-5 border-b-2 border-[#101426]/10 flex items-center gap-2">
          <Newspaper className="size-5 text-[#5b35d5]" />
          <h2 className="text-base font-black">News & Updates</h2>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-end gap-3 mb-5">
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs font-bold uppercase text-[#101426]/40 block mb-1">Title</label>
              <input value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="w-full border-2 border-[#101426]/15 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5b35d5]" />
            </div>
            <select value={newsTag} onChange={(e) => setNewsTag(e.target.value)} className="border-2 border-[#101426]/15 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-[#5b35d5]">
              <option value="feature">Feature</option>
              <option value="update">Update</option>
              <option value="fix">Fix</option>
              <option value="news">News</option>
            </select>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold uppercase text-[#101426]/40 block mb-1">Body</label>
              <input value={newsBody} onChange={(e) => setNewsBody(e.target.value)} className="w-full border-2 border-[#101426]/15 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5b35d5]" />
            </div>
            <button onClick={handleCreateNews} disabled={!newsTitle.trim() || !newsBody.trim()} className="flex items-center gap-1.5 rounded-full bg-[#c9ff5a] border-2 border-[#101426] px-4 py-2 text-xs font-black hover:bg-white transition disabled:opacity-40">
              <Plus className="size-3.5" />Publish
            </button>
          </div>

          <div className="space-y-2">
            {newsList.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-[#101426]/8 p-3">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase rounded-full px-2 py-0.5 bg-[#e9e5ff] text-[#5b35d5]">{item.tag}</span>
                  <div>
                    <div className="text-sm font-bold">{item.title}</div>
                    <div className="text-xs text-[#101426]/40">{item.body}</div>
                  </div>
                </div>
                <button onClick={() => handleDeleteNews(item.id)} className="text-[#101426]/30 hover:text-[#ff6b57] transition">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {newsList.length === 0 && <p className="text-sm text-[#101426]/30 text-center py-4">No news published.</p>}
          </div>
        </div>
      </div>

      {/* Product Feedback */}
      <div className="mt-6 overflow-hidden rounded-[22px] border border-[#101426]/10 bg-white shadow-[0_14px_38px_rgba(16,20,38,.055)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#101426]/8 p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#eeeaff] text-[#5b35d5]"><MessageSquare className="size-4" /></span>
            <div>
              <h2 className="text-base font-black">Product Feedback</h2>
              <p className="text-xs text-[#101426]/40">Ideas, votes and conversations from users</p>
            </div>
          </div>
          <button onClick={() => router.push("/feedback")} className="rounded-xl bg-[#5b35d5] px-4 py-2 text-xs font-black text-white transition hover:bg-[#4826bd]">Open feedback board</button>
        </div>

        <div className="divide-y divide-[#101426]/8">
          {feedbackList.slice(0, 12).map((item: any) => (
            <div key={item.id} className="grid gap-3 p-4 transition hover:bg-[#fafafe] sm:grid-cols-[1fr_auto] sm:items-center">
              <button onClick={() => router.push(`/feedback?post=${item.id}`)} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#f1eff8] px-2 py-0.5 text-[9px] font-black uppercase text-[#656979]">{item.category}</span>
                  <span className="text-[10px] font-semibold text-[#101426]/35">{item.authorName}</span>
                </div>
                <div className="mt-1 truncate text-sm font-black">{item.title}</div>
                <div className="mt-1 flex items-center gap-3 text-[10px] font-bold text-[#101426]/40">
                  <span className="flex items-center gap-1"><ArrowUp className="size-3" />{item.upvotes}</span>
                  <span className="flex items-center gap-1"><ArrowDown className="size-3" />{item.downvotes}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="size-3" />{item.comments?.length || 0}</span>
                </div>
              </button>
              <select value={item.status} onChange={(event) => void handleFeedbackStatus(item.id, event.target.value)} className="h-9 rounded-xl border border-[#101426]/10 bg-white px-3 text-xs font-black outline-none focus:border-[#5b35d5]/40">
                <option value="open">Received</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="declined">Not planned</option>
              </select>
            </div>
          ))}
          {feedbackList.length === 0 && <p className="py-10 text-center text-sm font-semibold text-[#101426]/35">No feedback submitted yet.</p>}
        </div>
      </div>
    </div>
  );
}
