<?php
  session_start();
  include_once 'database.php'; // Include your config file here

  // Get data
  $name = mysqli_real_escape_string($conn, htmlentities(strip_tags(stripcslashes($_GET['username']))));
  $email = mysqli_real_escape_string($conn, htmlentities(strip_tags(stripcslashes($_GET['email']))));
  $phone = mysqli_real_escape_string($conn, htmlentities(strip_tags(stripcslashes($_GET['phone']))));
  $amount = mysqli_real_escape_string($conn, htmlentities(strip_tags(stripcslashes($_GET['amount']))));
  $orderdate = mysqli_real_escape_string($conn, htmlentities(strip_tags(stripcslashes($_GET['date'])))); // order date
  $ref = mysqli_real_escape_string($conn, htmlentities(strip_tags(stripcslashes($_GET['ref']))));

  // Convert date format
  $dtb = strtotime($orderdate);
  $dbkd = date('Y-m-d', $dtb);

  // Verify payment
  $curl = curl_init();
  $reference = $ref;

  if(!$reference) {
    die(json_encode(['status' => 'error', 'message' => 'Invalid reference']));
  }

  curl_setopt_array($curl, array(
    CURLOPT_URL => "https://api.paystack.co/transaction/verify/".rawurlencode($reference),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
      "accept: application/json",
      "authorization: Bearer PAYSTACK_SECRET_KEY, // Your Paystack private key
      "cache-control: no-cache"
    ],
  ));

  $response = curl_exec($curl);
  $err = curl_error($curl);

  if($err){
    die(json_encode(['status' => 'error', 'message' => 'Paystack Curl returned error: ' . $err]));
  }

  $tranx = json_decode($response);

  if(!$tranx->status){
    die(json_encode(['status' => 'error', 'message' => 'Payment API returned error: ' . $tranx->message]));
  }

  if($tranx->data->status == 'success'){
    // Payment was successful
    $amountPaid = $tranx->data->amount / 100; // Amount in Naira
    $query = "UPDATE table_name SET wallet = wallet + $amountPaid WHERE username = '$name'";
    if (mysqli_query($conn, $query)) {
      die(json_encode(['status' => 'success', 'message' => 'Payment successful']));
    } else {
      die(json_encode(['status' => 'error', 'message' => 'Database update failed']));
    }
  } else {
    die(json_encode(['status' => 'error', 'message' => 'Payment failed']));
  }
?>