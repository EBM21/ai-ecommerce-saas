import fs from 'fs';

let content = fs.readFileSync('src/app/dashboard/dashboard-client.tsx', 'utf8');

// Add handleExport function
content = content.replace(
  /export default function DashboardClient\(\{\n    storeName, stats, chartData, recentOrders, topProducts\n\}: Props\) \{/,
  `export default function DashboardClient({
    storeName, stats, chartData, recentOrders, topProducts
}: Props) {
    const handleExport = () => {
        if (!recentOrders || recentOrders.length === 0) {
            alert("No recent orders to export.");
            return;
        }
        
        const headers = ["Order ID", "Customer", "Status", "Amount", "Time"];
        const csvContent = [
            headers.join(","),
            ...recentOrders.map(o => [
                o.id,
                \`"\${o.customer}"\`,
                o.status,
                \`"\${o.amount}"\`,
                \`"\${o.time}"\`
            ].join(","))
        ].join("\\n");
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", \`\${storeName.replace(/\\s+/g, '_')}_recent_orders.csv\`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };`
);

// Add onClick to Export button
content = content.replace(
  /<button className="hidden sm:flex items-center gap-2 px-4 py-2\.5 rounded-xl bg-secondary border border-border text-secondary-foreground hover:bg-secondary\/80 transition-all text-sm">/,
  `<button onClick={handleExport} className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80 transition-all text-sm">`
);

fs.writeFileSync('src/app/dashboard/dashboard-client.tsx', content, 'utf8');
console.log('Fixed export button in dashboard-client');
