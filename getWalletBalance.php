<?php
include_once 'database.php'; // Include your config file here

$username = mysqli_real_escape_string($conn, htmlentities(strip_tags($_GET['username'])));

$query = "SELECT wallet FROM table_name WHERE username = '$username'";
$result = mysqli_query($conn, $query);

if ($result) {
    $row = mysqli_fetch_assoc($result);
    echo json_encode(['status' => 'success', 'amount' => $row['wallet']]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch wallet balance']);
}
?>