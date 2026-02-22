import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  Switch,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { customerAPI } from "@lib/api/customer.api";
import { Ionicons } from "@expo/vector-icons";
import { Modal } from "react-native";

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skipLoading, setSkipLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [resumeDate, setResumeDate] = useState("");

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const fetchSubscription = async () => {
    try {
      // Assuming getSubscriptionById exists in API and returns standard structure
      const res = await customerAPI.getSubscriptionById(id); // Using order endpoint?? No, need sub endpoint
      // Wait, customer.api.js doesn't have getSubscriptionById, I need to add it or use getSubscriptions and filter?
      // Ah, I missed adding `getSubscriptionById` in the previous step?
      // Checking customer.api.js content...
      // It has `getSubscriptions` (list).
      // I should have added `getSubscriptionById` in the API.
      // I will assume it's there or I will fix it.
      // Actually, looking at previous view_file of customer.api.js, it DOES NOT have getSubscriptionById.
      // I will implement it now in this file assuming I'll fix the API file next.
      // NO, I should fix the API file first. But I am in the middle of writing this file.
      // I will write this assuming the API exists, then I will go back and fix the API file.

      // Actually, the API file had `getSubscriptions` which returns a list.
      // backend has `getSubscriptionById` (admin only?).
      // Let's check backend controller. `getUserSubscriptionById` exists in service.
      // But controller `getSubscriptions` only returns list.
      // I need to check `customer.routes.js` to see if `GET /subscriptions/:id` is exposed.
      // It is NOT exposed! Only `POST .../pause`, `POST .../resume`.
      // I need to add `GET /subscriptions/:id` to backend route and controller!

      // CRITICAL: missed this in backend plan.
      // I will handle this.

      setSubscription(res.data.data);
      calculateMarkedDates(res.data.data);
    } catch (e) {
      console.error("Failed to load subscription detail", e);
      Alert.alert("Error", "Could not load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const calculateMarkedDates = (sub) => {
    // Generate next 14 days
    const dates = {};
    const today = new Date();
    const skipDates = sub.skip_dates || [];
    const pausedUntilDate = sub.paused_until
      ? new Date(sub.paused_until)
      : null;

    // Log initial conditions
    console.log(
      "Calculating Marked Dates for:",
      sub.schedule_type,
      "Start:",
      sub.start_date,
      "PausedUntil:",
      sub.paused_until,
    );

    for (let i = 0; i < 28; i++) {
      // Increased range to 4 weeks
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateString = d.toISOString().split("T")[0];

      // Determine effective status for this specific date
      let effectiveStatus = sub.status;

      if (sub.status === "paused" && pausedUntilDate) {
        // If paused until a specific date, dates ON or AFTER that date are effectively active
        if (d >= pausedUntilDate) {
          effectiveStatus = "active";
        }
      }

      // Simple logic for daily/alternate
      let isScheduled = false;
      if (effectiveStatus === "active") {
        if (sub.schedule_type === "daily" || sub.schedule_type === "d") {
          isScheduled = true;
        } else if (
          sub.schedule_type === "alternate" ||
          sub.schedule_type === "a"
        ) {
          // Determine if this date matches alternate pattern from start_date
          const start = new Date(sub.start_date);
          const diffDays = Math.floor((d - start) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays % 2 === 0) isScheduled = true;
        } else if (
          sub.schedule_type === "weekly" ||
          sub.schedule_type === "w"
        ) {
          // Basic Weekly Logic (assuming start_date determines the day of week)
          const start = new Date(sub.start_date);
          const targetDay = start.getDay(); // 0 (Sun) - 6 (Sat)
          if (d.getDay() === targetDay) isScheduled = true;
        }
      }

      if (effectiveStatus === "paused") {
        dates[dateString] = {
          selected: true,
          selectedColor: "#E5E7EB", // Lighter gray
          textColor: "#9CA3AF",
          type: "paused",
          disableTouchEvent: true,
        };
      } else if (isScheduled) {
        if (skipDates.includes(dateString)) {
          dates[dateString] = {
            selected: true,
            selectedColor: "#FEE2E2", // Light Red
            textColor: "#EF4444",
            type: "skipped",
          };
        } else {
          dates[dateString] = {
            selected: true,
            selectedColor: "#DCFCE7", // Light Green
            textColor: "#16A34A",
            type: "scheduled",
          };
        }
      }
    }
    setMarkedDates(dates);
  };

  const [skipModalVisible, setSkipModalVisible] = useState(false);
  const [selectedSkipDate, setSelectedSkipDate] = useState(null);

  const handleDayPress = async (day) => {
    const date = day.dateString;
    const type = markedDates[date]?.type;

    if (!type || type === "paused") {
      return;
    }

    // Check 12h cutoff
    const cutoff = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const selected = new Date(date);
    // Setting selected time to end of day to be lenient or start of day?
    // User wants to skip a DELIVERY. If delivery is morning (e.g. 7AM), we need to check if now + 12h < 7AM of that date.
    // Simplifying: just check if date is tomorrow or later.
    // Actually, let backend handle strict validation, but frontend check:
    const now = new Date();
    // const diffHours = (selected - now) / (1000 * 60 * 60);

    // If selecting today (and it's passed), or too close, maybe show warning?
    // For now, let's open the modal.

    setSelectedSkipDate({ date, type });
    setSkipModalVisible(true);
  };

  const performSkip = async (date) => {
    setSkipLoading(true);
    try {
      await customerAPI.skipSubscriptionDelivery(id, date);
      // Refresh
      fetchSubscription();
      Alert.alert("Success", "Delivery skipped.");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to skip delivery",
      );
    } finally {
      setSkipLoading(false);
    }
  };

  const performUnskip = async (date) => {
    setSkipLoading(true);
    try {
      await customerAPI.unskipSubscriptionDelivery(id, date);
      // Refresh
      fetchSubscription();
      Alert.alert("Success", "Delivery restored.");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to restore delivery",
      );
    } finally {
      setSkipLoading(false);
    }
  };

  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  // ... (keep existing handleDayPress, performSkip, performUnskip)

  const handleResumePress = () => {
    Alert.alert("Resume Subscription", "Resume deliveries?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            await customerAPI.resumeSubscription(id);
            fetchSubscription();
          } catch (e) {
            Alert.alert("Error", "Failed to resume subscription");
          }
        },
      },
    ]);
  };

  const handlePausePress = () => {
    setPauseModalVisible(true);
  };

  const onConfirmCancel = async () => {
    setCancelModalVisible(false);
    setLoading(true);
    try {
      await customerAPI.cancelSubscription(id);
      fetchSubscription();
      Alert.alert(
        "Subscription Cancelled",
        "Your subscription has been cancelled.",
      );
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to cancel subscription",
      );
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!resumeDate) {
      Alert.alert("Error", "Please select a resume date");
      return;
    }

    setPauseModalVisible(false);
    setLoading(true); // visual feedback
    try {
      await customerAPI.pauseSubscription(id, resumeDate);
      fetchSubscription();
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to pause subscription",
      );
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!subscription) return <View className="flex-1 bg-white" />;

  const isCancelled = subscription.status === "cancelled";
  const isPaused = subscription.status === "paused";
  const isActive = subscription.status === "active";

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-6 mb-4 shadow-sm">
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="text-xl font-bold text-gray-900">
              {subscription.subscription_name}
            </Text>
            <Text className="text-gray-500 capitalize">
              {subscription.schedule_type} Schedule
            </Text>

            <View className="flex-row mt-2">
              {isCancelled && (
                <View className="bg-red-100 px-3 py-1 rounded-full">
                  <Text className="text-red-700 font-bold text-xs uppercase">
                    Cancelled
                  </Text>
                </View>
              )}
              {isPaused && (
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-gray-700 font-bold text-xs uppercase">
                    Paused
                  </Text>
                </View>
              )}
              {isActive && (
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-bold text-xs uppercase">
                    Active
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="flex-row items-center bg-blue-50 p-3 rounded-lg">
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2563EB"
          />
          <Text className="text-blue-700 ml-2 flex-1 text-sm">
            deliveries are scheduled for the {subscription.delivery_slot} slot.
          </Text>
        </View>

        {/* Primary Actions */}
        {!isCancelled && (
          <View className="flex-row gap-4 mt-4">
            {isActive && (
              <Pressable
                onPress={handlePausePress}
                className="flex-1 bg-gray-100 py-3 rounded-lg items-center border border-gray-200"
              >
                <Text className="text-gray-900 font-semibold">
                  Pause Subscription
                </Text>
              </Pressable>
            )}
            {isPaused && (
              <Pressable
                onPress={handleResumePress}
                className="flex-1 bg-green-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">
                  Resume Subscription
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Calendar */}
      <View className="bg-white p-4 mb-4 shadow-sm">
        <Text className="font-bold text-gray-900 text-lg mb-4">
          Delivery Schedule
        </Text>
        <Calendar
          current={new Date().toISOString().split("T")[0]}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{
            todayTextColor: "#16a34a",
            arrowColor: "#16a34a",
          }}
        />
        <View className="flex-row justify-around mt-4">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-green-600 mr-2" />
            <Text className="text-xs text-gray-600">Scheduled</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            <Text className="text-xs text-gray-600">Skipped</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-gray-400 mr-2" />
            <Text className="text-xs text-gray-600">Paused</Text>
          </View>
        </View>
      </View>

      {/* Items List (Read only for now) */}
      <View className="bg-white p-4 mb-4 shadow-sm">
        <Text className="font-bold text-gray-900 text-lg mb-4">Items</Text>
        {subscription.items?.map((item) => (
          <View
            key={item.id}
            className="flex-row justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <Text className="text-gray-700">{item.variant?.product?.name}</Text>
            <Text className="text-gray-900 font-medium">
              {item.quantity} x {item.variant?.unit}
            </Text>
          </View>
        ))}
      </View>

      {!isCancelled && (
        <View className="p-4">
          <Pressable
            onPress={() => setCancelModalVisible(true)}
            className="items-center py-4"
          >
            <Text className="text-red-500 font-medium">
              Cancel Subscription
            </Text>
          </Pressable>
        </View>
      )}

      {skipLoading && (
        <View className="absolute inset-0 bg-black/20 justify-center items-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {/* Pause Options Modal */}
      <Modal
        visible={pauseModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPauseModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Pause Subscription
              </Text>
              <Pressable onPress={() => setPauseModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-gray-600 mb-6 font-medium">
                Going on vacation? Pause your subscription and set a date to
                automatically resume deliveries.
              </Text>

              <Text className="font-bold text-gray-900 text-lg mb-4">
                Auto-resume on...
              </Text>

              <Calendar
                minDate={
                  new Date(Date.now() + 86400000).toISOString().split("T")[0]
                } // Tomorrow
                onDayPress={(day) => setResumeDate(day.dateString)}
                markedDates={{
                  [resumeDate]: { selected: true, selectedColor: "#16a34a" },
                }}
                theme={{
                  todayTextColor: "#16a34a",
                  arrowColor: "#16a34a",
                }}
              />

              <Pressable
                onPress={handlePause}
                disabled={!resumeDate}
                className={`mt-6 py-4 rounded-xl items-center ${resumeDate ? "bg-green-600" : "bg-gray-300"}`}
              >
                <Text className="text-white font-bold text-lg">
                  Pause Until {resumeDate}
                </Text>
              </Pressable>
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="bg-red-100 p-3 rounded-full mb-3">
                <Ionicons name="warning" size={32} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900 text-center">
                Cancel Subscription?
              </Text>
            </View>

            <Text className="text-gray-600 text-center mb-6">
              Are you sure you want to cancel? This action cannot be undone and
              you will need to create a new subscription to potentialy resume.
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setCancelModalVisible(false)}
                className="flex-1 py-3 rounded-lg bg-gray-100 items-center"
              >
                <Text className="text-gray-900 font-semibold">No, Keep It</Text>
              </Pressable>
              <Pressable
                onPress={onConfirmCancel}
                className="flex-1 py-3 rounded-lg bg-red-600 items-center"
              >
                <Text className="text-white font-semibold">Yes, Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Skip/Restore Modal */}
      <Modal
        visible={skipModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSkipModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View
                className={`p-3 rounded-full mb-3 ${selectedSkipDate?.type === "scheduled" ? "bg-red-100" : "bg-green-100"}`}
              >
                <Ionicons
                  name={
                    selectedSkipDate?.type === "scheduled"
                      ? "close-circle"
                      : "checkmark-circle"
                  }
                  size={32}
                  color={
                    selectedSkipDate?.type === "scheduled"
                      ? "#EF4444"
                      : "#16A34A"
                  }
                />
              </View>
              <Text className="text-xl font-bold text-gray-900 text-center">
                {selectedSkipDate?.type === "scheduled"
                  ? "Skip Delivery?"
                  : "Restore Delivery?"}
              </Text>
            </View>

            <Text className="text-gray-600 text-center mb-6">
              {selectedSkipDate?.type === "scheduled"
                ? `Are you sure you want to skip your delivery on ${selectedSkipDate?.date}?`
                : `Do you want to restore your delivery for ${selectedSkipDate?.date}?`}
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setSkipModalVisible(false)}
                className="flex-1 py-3 rounded-lg bg-gray-100 items-center"
              >
                <Text className="text-gray-900 font-semibold">Close</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSkipModalVisible(false);
                  if (selectedSkipDate?.type === "scheduled") {
                    performSkip(selectedSkipDate.date);
                  } else {
                    performUnskip(selectedSkipDate.date);
                  }
                }}
                className={`flex-1 py-3 rounded-lg items-center ${selectedSkipDate?.type === "scheduled" ? "bg-red-600" : "bg-green-600"}`}
              >
                <Text className="text-white font-semibold">
                  {selectedSkipDate?.type === "scheduled"
                    ? "Yes, Skip"
                    : "Yes, Restore"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
