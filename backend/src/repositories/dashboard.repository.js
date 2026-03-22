const { Op, fn, col } = require("sequelize");
const {
  Order,
  Subscription,
  User,
  WalletTransaction,
} = require("../models");

const getOrderStatsForDate = async (date) => {
  const where = { delivery_date: date };

  const [total, byStatus, bySlot, revenueResult] = await Promise.all([
    Order.count({ where }),
    Order.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["status"],
      raw: true,
    }),
    Order.findAll({
      attributes: ["delivery_slot", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["delivery_slot"],
      raw: true,
    }),
    Order.findOne({
      attributes: [[fn("SUM", col("total_price")), "revenue"]],
      where,
      raw: true,
    }),
  ]);

  const statusMap = {};
  byStatus.forEach((r) => {
    statusMap[r.status] = parseInt(r.count, 10);
  });

  const slotMap = {};
  bySlot.forEach((r) => {
    slotMap[r.delivery_slot] = parseInt(r.count, 10);
  });

  return {
    total,
    revenue: parseFloat(revenueResult?.revenue || 0),
    by_status: statusMap,
    morning: {
      count: slotMap.morning || 0,
    },
    evening: {
      count: slotMap.evening || 0,
    },
  };
};

const getSubscriptionOrderCount = async (date) => {
  const [subscriptionOrders, manualOrders] = await Promise.all([
    Order.count({
      where: {
        delivery_date: date,
        subscription_id: { [Op.ne]: null },
      },
    }),
    Order.count({
      where: {
        delivery_date: date,
        subscription_id: null,
      },
    }),
  ]);
  return { subscription: subscriptionOrders, manual: manualOrders };
};

const getSubscriptionStats = async () => {
  const [byStatus, bySchedule] = await Promise.all([
    Subscription.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true,
    }),
    Subscription.findAll({
      attributes: ["schedule_type", [fn("COUNT", col("id")), "count"]],
      where: { status: "active" },
      group: ["schedule_type"],
      raw: true,
    }),
  ]);

  const statusMap = { active: 0, paused: 0, cancelled: 0 };
  byStatus.forEach((r) => {
    statusMap[r.status] = parseInt(r.count, 10);
  });

  const scheduleMap = {};
  bySchedule.forEach((r) => {
    scheduleMap[r.schedule_type] = parseInt(r.count, 10);
  });

  return { ...statusMap, by_schedule: scheduleMap };
};

const getCustomerStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, newThisMonth, atRiskCount] = await Promise.all([
    User.count({ where: { user_type: "customer" } }),
    User.count({
      where: {
        user_type: "customer",
        created_at: { [Op.gte]: startOfMonth },
      },
    }),
    // Customers with active subscriptions AND wallet < 500
    User.count({
      where: {
        user_type: "customer",
        wallet_balance: { [Op.lt]: 500 },
      },
      include: [
        {
          model: Subscription,
          as: "subscriptions",
          required: true,
          where: { status: "active" },
          attributes: [],
        },
      ],
    }),
  ]);

  return { total, new_this_month: newThisMonth, at_risk: atRiskCount };
};

const getRevenueComparison = async (today, yesterday, tomorrow) => {
  const [todayRevenue, yesterdayRevenue] = await Promise.all([
    WalletTransaction.findOne({
      attributes: [[fn("SUM", col("amount")), "total"]],
      where: {
        type: "purchase",
        direction: "debit",
        created_at: {
          [Op.gte]: new Date(`${today}T00:00:00`),
          [Op.lt]: new Date(`${tomorrow}T00:00:00`),
        },
      },
      raw: true,
    }),
    WalletTransaction.findOne({
      attributes: [[fn("SUM", col("amount")), "total"]],
      where: {
        type: "purchase",
        direction: "debit",
        created_at: {
          [Op.gte]: new Date(`${yesterday}T00:00:00`),
          [Op.lt]: new Date(`${today}T00:00:00`),
        },
      },
      raw: true,
    }),
  ]);

  return {
    today: parseFloat(todayRevenue?.total || 0),
    yesterday: parseFloat(yesterdayRevenue?.total || 0),
  };
};

const getWalletDepositsToday = async (today, tomorrow) => {
  const result = await WalletTransaction.findOne({
    attributes: [
      [fn("SUM", col("amount")), "total"],
      [fn("COUNT", col("id")), "count"],
    ],
    where: {
      type: "deposit",
      direction: "credit",
      created_at: {
        [Op.gte]: new Date(`${today}T00:00:00`),
        [Op.lt]: new Date(`${tomorrow}T00:00:00`),
      },
    },
    raw: true,
  });

  return {
    total: parseFloat(result?.total || 0),
    count: parseInt(result?.count || 0, 10),
  };
};

const getRecentOrders = async (limit = 10) => {
  return Order.findAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "phone"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
  });
};

const getRecentTransactions = async (limit = 10) => {
  return WalletTransaction.findAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
  });
};

const getAtRiskCustomers = async (limit = 10) => {
  return User.findAll({
    where: {
      user_type: "customer",
      wallet_balance: { [Op.lt]: 500 },
    },
    include: [
      {
        model: Subscription,
        as: "subscriptions",
        required: true,
        where: { status: "active" },
        attributes: ["id", "schedule_type"],
      },
    ],
    attributes: ["id", "first_name", "last_name", "phone", "wallet_balance"],
    order: [["wallet_balance", "ASC"]],
    limit,
  });
};

module.exports = {
  getOrderStatsForDate,
  getSubscriptionOrderCount,
  getSubscriptionStats,
  getCustomerStats,
  getRevenueComparison,
  getWalletDepositsToday,
  getRecentOrders,
  getRecentTransactions,
  getAtRiskCustomers,
};
