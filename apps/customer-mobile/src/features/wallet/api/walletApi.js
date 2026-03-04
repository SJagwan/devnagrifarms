import api from "../../../lib/apiClient";

export const walletApi = {
  getPassbook: async () => {
    const response = await api.get("/customer/wallet/passbook");
    return response.data;
  },

  createAddFundsOrder: async (amount) => {
    const response = await api.post("/customer/payments/create-order", {
      amount,
    });
    return response.data;
  },

  verifyPayment: async (verificationData) => {
    const response = await api.post(
      "/customer/payments/verify",
      verificationData,
    );
    return response.data;
  },
};
