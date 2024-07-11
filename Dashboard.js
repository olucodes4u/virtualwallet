import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = ({ navigation }) => {
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
          fetchWalletBalance(parsedData.username); // Fetch wallet balance after setting user data
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchWalletBalance = async (username) => {
    try {
      const response = await fetch(
        `https://domainname.com/api/getWalletBalance.php?username=${username}`
      );
      const responseText = await response.text();

      try {
        const data = JSON.parse(responseText);
        if (data.status === "success") {
          setUserData((prevData) => ({
            ...prevData,
            wallet: data.amount,
          }));
        } else {
          console.error("Failed to fetch wallet balance:", data.message);
        }
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  useEffect(() => {
    // Listen for focus events to refresh balance when the user navigates back
    const unsubscribe = navigation.addListener("focus", () => {
      if (userData) {
        fetchWalletBalance(userData.username);
      }
    });

    return unsubscribe;
  }, [navigation, userData]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Hi {userData ? userData.fullname : "User"}
      </Text>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Wallet Balance</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balance}>
            {balanceVisible
              ? `₦${userData ? userData.wallet : "0.00"}`
              : "****"}
          </Text>
          <TouchableOpacity onPress={toggleBalanceVisibility}>
            <MaterialIcons
              name={balanceVisible ? "visibility" : "visibility-off"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.accountNumber}>
          Wallet ID: {userData ? userData.username : "Unknown"}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("FundWallet")}
        >
          <Text style={styles.addButtonText}>Fund Wallet</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.quickAccess}>
        <Text style={styles.quickAccessTitle}>Quick Access</Text>
        <View style={styles.quickAccessRow}>
          <TouchableOpacity
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate("Airtime")}
          >
            <View>
              <MaterialIcons name="phone" size={18} color="black" />
              <Text>Airtime</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate("Data")}
          >
            <View>
              <MaterialIcons name="data-usage" size={18} color="black" />
              <Text>Data</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate("Cable")}
          >
            <View>
              <MaterialIcons name="tv" size={18} color="black" />
              <Text>Cable</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate("Electricity")}
          >
            <View>
              <MaterialIcons name="flash-on" size={18} color="black" />
              <Text>Electricity</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.transactions}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionsTitle}>Transactions</Text>
          <Text style={styles.viewAll}>View all</Text>
        </View>
        <Text>No transaction history</Text>
        <Text style={styles.transactionInfo}>
          Once you start paying bills or fund wallet, you can keep track of your
          transactions here
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 30,
  },
  balanceContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#3b9414",
  },
  balanceTitle: {
    fontSize: 16,
    color: "#fff",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  balance: {
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 8,
    color: "#fff",
  },
  accountNumber: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#3b9414",
    fontWeight: "bold",
  },
  quickAccess: {
    marginBottom: 16,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  quickAccessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAccessItem: {
    alignItems: "center",
    padding: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    flex: 1,
    margin: 4,
  },
  transactions: {
    alignItems: "center",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  viewAll: {
    color: "#3b9414",
  },
  transactionInfo: {
    color: "#888",
  },
});

export default Dashboard;
