import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import RazorpayCheckout from "react-native-razorpay";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../../context/AuthContext";
import { walletApi } from "../api/walletApi";
import { Ionicons } from "@expo/vector-icons";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];
const MIN_AMOUNT = 500;

export default function AddFundsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus input on load for better UX
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handlePresetSelect = (val) => {
    // Increment the amount instead of replacing, if user clicks multiple times
    const current = parseInt(amount || "0", 10);
    setAmount((current + val).toString());
  };

  const handleProceed = async () => {
    const numAmount = parseInt(amount, 10);

    if (isNaN(numAmount) || numAmount < MIN_AMOUNT) {
      Alert.alert(
        "Invalid Amount",
        `Minimum recharge amount is ₹${MIN_AMOUNT}`,
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend
      const orderRes = await walletApi.createAddFundsOrder(numAmount);

      if (!orderRes.success) {
        throw new Error(orderRes.message || "Failed to create order");
      }

      // Backend returns amount already in paise (multiplied by 100)
      const {
        gatewayOrderId,
        amount: rzpAmount,
        currency,
        keyId,
      } = orderRes.data;

      // Clean up prefill to avoid passing empty strings which can cause SDK validation errors
      const prefill = {};
      if (user?.email) prefill.email = user.email;
      if (user?.phone) prefill.contact = user.phone;
      if (user?.name) prefill.name = user.name;

      // 2. Open Razorpay Checkout
      const options = {
        description: "Wallet Top-up",
        image: "https://devnagrifarms.com/logo.png", // Replace with real URL if available
        currency: currency,
        key: keyId,
        amount: rzpAmount.toString(), // Ensure amount is a string
        name: "Devnagri Farms",
        order_id: gatewayOrderId,
        prefill: prefill,
        theme: { color: "#16a34a" },
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          // 3. Verify Payment
          try {
            await walletApi.verifyPayment({
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
            });

            Alert.alert("Success", "Funds added to your wallet successfully", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            // Even if verification fails here, webhook might process it, but we alert the user
            Alert.alert(
              "Payment Processing",
              "Your payment is being processed. Wallet will be updated shortly.",
              [{ text: "OK", onPress: () => router.back() }],
            );
          } finally {
            setLoading(false);
          }
        })
        .catch((error) => {
          setLoading(false);
          // Handle payment failure / cancellation
          let errorCode = error?.code;
          let errorDesc = error?.description || error?.message;

          // If it's a string, it might be the description itself
          if (typeof error === "string") {
            errorDesc = error;
          }

          if (errorCode !== 2 && errorCode !== 0) {
            // 2 = user cancelled in Android, 0 = cancelled in iOS sometimes depending on wrapper
            Alert.alert(
              "Payment Failed",
              `Error: ${errorDesc || "Could not complete payment"}`,
            );
          }
        });
    } catch (err) {
      setLoading(false);
      console.error("Initiate payment error", err);
      Alert.alert("Error", err.message || "Could not initiate payment");
    }
  };

  const isAmountValid = parseInt(amount || "0", 10) >= MIN_AMOUNT;
  const isAmountEmpty = amount === "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-gray-900 font-bold text-xl">Top-up Wallet</Text>
          <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
            <Ionicons name="wallet-outline" size={14} color="#16a34a" />
            <Text className="text-green-700 font-bold text-sm ml-1">
              ₹{parseFloat(user?.wallet_balance || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <Text className="text-gray-500 font-medium mb-2 text-center">
            Enter Amount to Add
          </Text>

          <View className="flex-row items-center justify-center border-b border-gray-200 pb-2 mb-2">
            <Text className="text-4xl font-bold text-gray-400 mr-2">₹</Text>
            <TextInput
              ref={inputRef}
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              placeholder="0"
              className="text-5xl font-bold text-gray-900 min-w-[100px] text-center"
              maxLength={6}
            />
          </View>

          {!isAmountValid && !isAmountEmpty ? (
            <Text className="text-red-500 text-sm text-center mb-4">
              Minimum top-up amount is ₹{MIN_AMOUNT}
            </Text>
          ) : (
            <View className="h-4 mb-4" /> // Placeholder for spacing
          )}

          <View className="flex-row flex-wrap gap-3 justify-center mt-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Pressable
                key={preset}
                onPress={() => handlePresetSelect(preset)}
                className="bg-gray-50 border border-gray-200 px-5 py-2.5 rounded-full active:bg-gray-100 shadow-sm"
              >
                <Text className="text-gray-700 font-bold text-base">
                  + ₹{preset}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex-row mb-6">
          <Text className="text-xl mr-3">💡</Text>
          <Text className="flex-1 text-blue-800 text-sm leading-5">
            Funds added to your wallet are 100% secure and can be used for fast
            1-click checkouts and seamless subscription renewals.
          </Text>
        </View>

        <View className="mt-auto pt-4 pb-8">
          <Button
            title={
              isAmountValid ? `Proceed to Pay ₹${amount}` : "Enter valid amount"
            }
            onPress={handleProceed}
            loading={loading}
            disabled={!isAmountValid || loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
