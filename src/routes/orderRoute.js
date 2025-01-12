const express = require('express');
const {
  placeOrder,
  viewOrderByEmail,
  viewAllOrders,
  cancelOrder,
  modifyAddress,
} = require('../controller/orderController');
const router = express.Router();

router.post('/place', placeOrder);
router.get('/view/:email', viewOrderByEmail);
router.get('/view-all', viewAllOrders);
router.post('/cancel', cancelOrder);
router.post('/modify-address', modifyAddress);

module.exports = router;
