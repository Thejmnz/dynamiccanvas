"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  FileCode,
  Key,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  Shield,
  Activity,
  Eye,
  Palette,
} from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { DesignsSection } from "./designs-section";
import { useUserRole } from "@/hooks/use-user-role";

interface UserStats {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  image: string | null;
  createdAt: string | null;
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

export default function AdminDashboard() {
  const { role, loading: roleLoading, isAuthenticated } = useUserRole();
  const router = useRouter();
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"users" | "designs">("designs");

  useEffect(() => {
    if (roleLoading) return;

    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    if (role !== "superadmin") {
      router.push("/dashboard");
      return;
    }

    fetchAdminData();
  }, [role, roleLoading, isAuthenticated, router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats"),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#135bec]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#135bec]" />
          {t("admin_panel")}
        </h1>
        <p className="text-gray-600 mt-2">{t("admin_panel_desc")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("designs")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === "designs"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Palette className="w-4 h-4" />
          {t("designs")}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Users className="w-4 h-4" />
          {t("users")}
        </button>
      </div>

      {activeTab === "designs" ? (
        <DesignsSection />
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("total_users")}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                    <p className="text-xs text-green-600 mt-2">+{stats.usersThisMonth} {t("this_month")}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("total_templates")}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTemplates}</p>
                    <p className="text-xs text-green-600 mt-2">+{stats.templatesThisMonth} {t("this_month")}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileCode className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("total_projects")}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRenders}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("active_api_keys")}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApiKeys}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Key className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("search_users")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{t("all_roles")}</option>
                  <option value="user">{t("user_role")}</option>
                  <option value="admin">{t("admin_role")}</option>
                  <option value="superadmin">{t("superadmin_role")}</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("user")}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("role")}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("templates")}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("projects")}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("api_key")}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("registration")}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("actions")}</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <>
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name || t("no_name")}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "superadmin" ? "bg-red-100 text-red-800" : user.role === "admin" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                            {user.role || t("user_role")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{user.templatesCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{user.projectsCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.hasApiKey ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{t("active")}</span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{t("no_api_key")}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {expandedUser === user.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </td>
                      </tr>

                      {expandedUser === user.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <FileCode className="w-4 h-4" />
                                  {t("recent_templates")}
                                </h4>
                                <p className="text-sm text-gray-600">{user.templatesCount} {t("templates_created")}</p>
                                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {t("view_all")}
                                </button>
                              </div>

                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <Activity className="w-4 h-4" />
                                  {t("active_projects_label")}
                                </h4>
                                <p className="text-sm text-gray-600">{user.projectsCount} {t("projects_count")}</p>
                                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {t("view_projects")}
                                </button>
                              </div>

                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <Key className="w-4 h-4" />
                                  {t("api_key")}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {user.hasApiKey ? t("api_key_configured") : t("no_api_key")}
                                </p>
                                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {t("manage")}
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {t("contact")}
                              </button>
                              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                {t("view_full_profile")}
                              </button>
                              <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {t("change_role")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}

                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t("no_users_found")}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
