import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { walletApi } from "../api/walletApi";
import { useAuth } from "../../../context/AuthContext";

export default function WalletScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else if (transactions.length === 0) setLoading(true);

    try {
      const [passbookRes] = await Promise.all([
        walletApi.getPassbook(),
        refreshUser(),
      ]);

      setTransactions(passbookRes.data.items || []);
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
      Alert.alert("Error", "Could not load wallet information");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const renderTransaction = ({ item }) => {
    const isCredit =
      ["deposit", "refund", "adjustment"].includes(item.type) &&
      item.amount > 0;
    // Note: adjustment can be negative, but let's assume amount is stored as absolute and type defines direction,
    // actually backend stores absolute amount and type defines direction. If adjustment is negative, we might need to check balance_after.
    // Let's assume deposit/refund are credit. Purchase is debit.
    const actualIsCredit =
      item.type === "deposit" ||
      item.type === "refund" ||
      (item.type === "adjustment" && item.amount > 0);

    return (
      <View className="bg-white p-4 mb-3 rounded-2xl border border-gray-100 flex-row items-center">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${
            actualIsCredit ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Ionicons
            name={actualIsCredit ? "arrow-down" : "arrow-up"}
            size={20}
            color={actualIsCredit ? "#16a34a" : "#dc2626"}
          />
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-gray-900 font-medium text-base capitalize">
            {item.type}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            {new Date(item.createdAt || item.created_at).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </Text>
          {item.description ? (
            <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <View className="items-end">
          <Text
            className={`font-bold text-lg ${
              actualIsCredit ? "text-green-600" : "text-gray-900"
            }`}
          >
            {actualIsCredit ? "+" : "-"}₹
            {parseFloat(Math.abs(item.amount)).toFixed(2)}
          </Text>
          <Text className="text-gray-400 text-xs mt-1">
            Bal: ₹{parseFloat(item.balance_after).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Balance Card */}
      <View className="bg-green-600 p-6 m-4 rounded-3xl shadow-sm">
        <Text className="text-green-100 font-medium mb-2">
          Available Balance
        </Text>
        <Text className="text-white text-4xl font-bold mb-6">
          ₹{parseFloat(user?.wallet_balance || 0).toFixed(2)}
        </Text>
        <Pressable
          onPress={() => router.push("/wallet/add-funds")}
          className="bg-white py-3 px-6 rounded-xl flex-row items-center justify-center self-start shadow-sm"
        >
          <Ionicons name="add-circle-outline" size={20} color="#16a34a" />
          <Text className="text-green-600 font-bold ml-2">Add Funds</Text>
        </Pressable>
      </View>

      <View className="px-4 pb-2">
        <Text className="text-lg font-bold text-gray-900">
          Recent Transactions
        </Text>
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            colors={["#16a34a"]}
            tintColor="#16a34a"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={24} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 font-medium">
              No transactions yet
            </Text>
            <Text className="text-gray-400 text-sm mt-1 text-center px-8">
              Add funds to your wallet to start using it for faster checkouts.
            </Text>
          </View>
        }
      />
    </View>
  );
}
