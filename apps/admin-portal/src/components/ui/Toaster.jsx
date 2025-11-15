import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#ffffff",
          color: "#111827",
          border: "1px solid #e5e7eb",
        },
        success: {
          iconTheme: {
            primary: "#778873",
            secondary: "#ffffff",
          },
        },
        error: {
          style: {
            borderColor: "#fecaca",
          },
        },
      }}
    />
  );
}
