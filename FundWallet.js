import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FundWallet = ({ navigation }) => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone: "",
  });
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await AsyncStorage.getItem("userData");
        if (data) {
          setUserData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Failed to fetch user data from AsyncStorage", error);
      }
    };

    fetchUserData();
  }, []);
  const authorization_url = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      <script src="https://js.paystack.co/v1/inline.js"></script>
    </head>
    <body>
      <div class="container">
    
        <form>
          <div class="form-group" style="display:none">
            <label for="username">Username:</label>
            <input type="text" class="form-control" id="username" value="${userData.username}"  />
          </div>
          <div class="form-group" style="display:none">
            <label for="email">Email:</label>
            <input type="email" class="form-control" id="email" value="${userData.email}"  />
          </div>
          <div class="form-group" style="display:none">
            <label for="phone">Phone:</label>
            <input type="tel" class="form-control" id="phone" value="${userData.phone}" />
          </div>
          <div class="form-group">
            <label for="amount">Enter Amount:</label>
            <input type="number" class="form-control" id="amount" />
          </div>
          <button type="button" style="background-color:#3b9414; color:#fff;
  font-size:18px" 
  class="btn btn-block" onclick="payWithPaystack()">Proceed</button>
        </form>
        <script>
          function payWithPaystack(){
            var username = document.getElementById('username').value;
            var email = document.getElementById('email').value;
            var phone = document.getElementById('phone').value;
            var amount = document.getElementById('amount').value;
            var date = new Date().getTime();
            var ref = '10' + Math.floor((Math.random() * 10001) + 1) + date;

            if (username == '' || email == '' || phone == '' || amount == '') {
              alert('Please fill all fields before you proceed.');
              return;
            }

            var handler = PaystackPop.setup({
              key: 'PAYSTACK_PUBLIC_KEY',
              email: email,
              amount: amount * 100,
              currency: "NGN",
              ref: ref,
              metadata: {
                custom_fields: [{
                  display_name: "Mobile Number",
                  variable_name: "mobile_number",
                  value: phone
                }]
              },
              callback: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  reference: response.reference,
                  amount: amount,
                  username: username,
                  email: email,
                  phone: phone,
                  date: date
                }));
              },
              onClose: function() {
                alert('Payment window closed.');
              }
            });
            handler.openIframe();
          }
        </script>
      </div>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    const { reference, amount, username, email, phone, date } = data;

    fetch(
      `https://domainname.com/api/confirmation.php?ref=${reference}&amount=${amount}&date=${date}&username=${username}&email=${email}&phone=${phone}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          navigation.navigate("Dashboard");
        } else {
          alert("Payment failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      });
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: authorization_url }}
        originWhitelist={["*"]}
        onMessage={handleWebViewMessage}
      />
      <View style={styles.backButtonContainer}>
        <Text onPress={() => navigation.navigate("Dashboard")}>
          Back To Wallet
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
  backButtonContainer: {
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
});

export default FundWallet;
