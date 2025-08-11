import { useCallback, useState } from "react";
import { Alert } from "react-native";

// const API_URL = "http://10.140.122.231:5001/api";
const API_URL = "https://rn-wallet-szfl.onrender.com/api";
// const API_URL = "http://localhost:5001/api"
export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expense: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // useCallback is used forperformance reasons. It will memoise the function
  const fetchTransaction = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/${userId}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/summary/${userId}`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      // Promise.all is so that the functions can be called in parallel
      await Promise.all([fetchTransaction(), fetchSummary()]);

      // Same as above
      // await fetchTransaction();
      // await fetchSummary();
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSummary, fetchTransaction, userId]);

  const deleteTransactions = async (id) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete transaction");

      // Referesh data after deleting
      loadData();
      Alert.alert("Success", "Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction", error);
      Alert.alert("Error", error.message);
    }
  };

  return { transactions, summary, isLoading, loadData, deleteTransactions };
};
