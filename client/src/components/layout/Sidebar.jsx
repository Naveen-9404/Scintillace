import { CalendarDays, ClipboardList, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const config = { student: [["Dashboard", "dashboard", LayoutDashboard], ["Profile", "profile", Users], ["My registrations", "registrations", ClipboardList], ["My teams", "teams", Users]], admin: [["Dashboard", "dashboard", LayoutDashboard], ["Users", "users", Users], ["Festivals", "festivals", CalendarDays], ["Events", "events", CalendarDays], ["Registrations", "registrations", ClipboardList], ["Teams", "teams", Users]], volunteer: [["Dashboard", "dashboard", LayoutDashboard], ["Assigned events", "events", CalendarDays], ["Attendance", "attendance", ShieldCheck]] };

export default function Sidebar({ role }) {
  return <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 lg:block"><span className="px-3 text-lg font-bold">Fest<span className="text-violet-400">Sphere</span></span><p className="px-3 pt-8 text-xs font-semibold uppercase tracking-widest text-slate-500">{role} workspace</p><nav className="mt-3 space-y-1">{config[role].map(([label, path, Icon]) => <NavLink key={path} to={`/${role}/${path}`} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-zinc-900 hover:text-white"}`}><Icon size={18} />{label}</NavLink>)}</nav></aside>;
}
