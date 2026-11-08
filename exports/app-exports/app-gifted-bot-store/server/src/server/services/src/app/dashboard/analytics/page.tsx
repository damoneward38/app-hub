export default async function AnalyticsPage() {
  const res = await fetch("/api/analytics");
  const data = await res.json();

  return (
    <div>
      <h1>Analytics</h1>
      <p>Total Revenue: ${data.totalRevenue}</p>
      <p>Total Purchases: {data.totalPurchases}</p>
    </div>
  );
}
