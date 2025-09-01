import { useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Index() {
  const filesPerHour = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        h: `${i + 8}:00`,
        v: Math.round(Math.random() * 20) + 5,
      })),
    [],
  );

  const loginsByHour = filesPerHour.map((d) => ({ h: d.h, v: Math.max(2, Math.round(d.v * 0.6)) }));

  const activity = [
    {
      ts: "2024-07-26 10:30:15",
      user: "john.doe@acme.com / sess_123",
      hour: "10 AM",
      apps: "VS Code, Slack",
      file: "ProjectX_Docs.docx",
      action: "Accessed sensitive document",
      anomaly: "Yes",
    },
    {
      ts: "2024-07-26 09:15:30",
      user: "jane.smith@acme.com / sess_124",
      hour: "09 AM",
      apps: "Chrome, Outlook",
      file: "report_Q2.xlsx",
      action: "Downloaded sales report",
      anomaly: "No",
    },
    {
      ts: "2024-07-26 11:00:00",
      user: "peter.jones@acme.com / sess_125",
      hour: "11 AM",
      apps: "Jira, Figma",
      file: "design_spec.pdf",
      action: "Shared design document externally",
      anomaly: "Yes",
    },
  ];

  const alerts = [
    { level: "Critical", title: "High-Volume Data Exfiltration", meta: "rare hour + high apps_open + unusual file_access" },
    { level: "High", title: "Sensitive File Access Anomaly", meta: "multiple failed login attempts + unusual file access pattern" },
    { level: "Medium", title: "Unusual App Install", meta: "new application install outside baseline" },
  ];

  return (
    <AppLayout>
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Last 15m</Button>
          <Button variant="secondary" size="sm">Last 1h</Button>
          <Button size="sm">Last 24h</Button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Sessions", value: 12 },
          { label: "Avg Login Time", value: "08:45" },
          { label: "Files Accessed", value: 324 },
          { label: "Anomalies Detected", value: 5 },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-muted/40 border p-4">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-3 text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg bg-muted/40 border">
          <div className="px-4 py-3 border-b">
            <div className="text-sm font-medium">Live Activity Log</div>
            <div className="text-xs text-muted-foreground">Real-time stream of user and system actions.</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="grid grid-cols-[1.2fr_1.6fr_0.5fr_1fr_1fr_1.5fr_0.5fr] gap-4 px-4 py-2">
                  <th>Timestamp</th>
                  <th>User/Session</th>
                  <th>Hour</th>
                  <th>Apps Open</th>
                  <th>File Access</th>
                  <th>Action Summary</th>
                  <th>Anom.</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row, i) => (
                  <tr key={i} className="grid grid-cols-[1.2fr_1.6fr_0.5fr_1fr_1fr_1.5fr_0.5fr] gap-4 px-4 py-3 border-t">
                    <td className="truncate">{row.ts}</td>
                    <td className="truncate">{row.user}</td>
                    <td>{row.hour}</td>
                    <td>{row.apps}</td>
                    <td className="truncate">{row.file}</td>
                    <td className="truncate">{row.action}</td>
                    <td className={row.anomaly === "Yes" ? "text-red-500" : "text-muted-foreground"}>{row.anomaly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 border p-4">
          <div className="text-sm font-medium mb-2">Real-time Alerts</div>
          <ul className="space-y-3">
            {alerts.map((a) => (
              <li key={a.title} className="rounded-md bg-background border p-3">
                <div className="text-xs text-muted-foreground">{a.level}</div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.meta}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-muted/40 border p-4">
          <div className="text-sm mb-3">Files Accessed Per Hour (24h)</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filesPerHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="h" tick={{ fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="v" fill="hsl(var(--sidebar-ring))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg bg-muted/40 border p-4">
          <div className="text-sm mb-3">Apps Open Distribution (24h)</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filesPerHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="h" tick={{ fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="v" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg bg-muted/40 border p-4">
          <div className="text-sm mb-3">Logins by Hours & Weekday</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loginsByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="h" tick={{ fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="v" fill="hsl(var(--secondary))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
