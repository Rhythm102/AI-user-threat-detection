import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ActivityLog() {
  const rows = new Array(8).fill(0).map((_, i) => ({
    ts: `2024-07-26 0${i}:30:15`,
    user: `user${i}@acme.com / sess_${100 + i}`,
    hour: `${8 + i} AM`,
    apps: i % 2 ? "Chrome, Outlook" : "VS Code, Slack",
    file: i % 2 ? "report_Q2.xlsx" : "project_alpha/src/main.py",
    action: i % 2 ? "Downloaded sales report" : "Accessed repository",
    anomaly: i % 3 ? "No" : "Yes",
  }));

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Activity Log</h1>
        <Button variant="secondary">Export CSV</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-6">
        <aside className="rounded-lg bg-muted/40 border p-4 space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Time Range</div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">15m</Button>
              <Button variant="secondary" size="sm">1h</Button>
              <Button size="sm">24h</Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">User</div>
            <Input placeholder="Select user" />
          </div>
          <div className="space-y-2">
            <div className="text-sm">Severity</div>
            <Input placeholder="Select severity" />
          </div>
          <div className="space-y-2">
            <div className="text-sm">Min Score</div>
            <Input defaultValue="0" />
          </div>
          <div className="space-y-2">
            <div className="text-sm">Action Type</div>
            <Input placeholder="Select action type" />
          </div>
          <Button className="w-full">Apply Filters</Button>
        </aside>
        <div className="rounded-lg bg-muted/40 border overflow-x-auto">
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
              {rows.map((row, i) => (
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
    </AppLayout>
  );
}
