const dashboardRepo = require("../repositories/dashboard.repository");

const getStats = async () => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 86400000)
    .toISOString()
    .split("T")[0];
  const tomorrow = new Date(now.getTime() + 86400000)
    .toISOString()
    .split("T")[0];

  const [
    orderStats,
    subscriptionOrderCount,
    subscriptionStats,
    customerStats,
    revenue,
    walletDeposits,
    recentOrders,
    recentTransactions,
    atRiskCustomers,
  ] = await Promise.all([
    dashboardRepo.getOrderStatsForDate(today),
    dashboardRepo.getSubscriptionOrderCount(today),
    dashboardRepo.getSubscriptionStats(),
    dashboardRepo.getCustomerStats(),
    dashboardRepo.getRevenueComparison(today, yesterday, tomorrow),
    dashboardRepo.getWalletDepositsToday(today, tomorrow),
    dashboardRepo.getRecentOrders(5),
    dashboardRepo.getRecentTransactions(5),
    dashboardRepo.getAtRiskCustomers(5),
  ]);

  return {
    today: {
      orders: orderStats,
      subscription_orders: subscriptionOrderCount,
      revenue,
      wallet_deposits: walletDeposits,
    },
    subscriptions: subscriptionStats,
    customers: customerStats,
    recent_orders: recentOrders,
    recent_transactions: recentTransactions,
    at_risk_customers: atRiskCustomers,
  };
};

module.exports = { getStats };
