const Order = require('../models/Orders');
const { v4: uuidv4 } = require('uuid');

// Place a new order
exports.placeOrder = async (req, res) => {
  const { name, email, deliveryAddress, items } = req.body;
  try {
    const deliveryTime = new Date();
    deliveryTime.setMinutes(deliveryTime.getMinutes() + 45); // Delivery in 45 minutes
    const orderId = uuidv4();
    const newOrder = new Order({ orderId, name, email, deliveryAddress, items, deliveryTime });
    await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order' });
  }
};

// View order details by email
exports.viewOrderByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const orders = await Order.find({ email, status: 'active' });
    if (!orders.length) return res.status(404).json({ message: 'No orders found' });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

// View all active orders
exports.viewAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'active' });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
  const { email, orderId } = req.body;
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, email },
      { status: 'cancelled' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

// Modify delivery address
exports.modifyAddress = async (req, res) => {
  const { email, orderId, newAddress } = req.body;
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, email },
      { deliveryAddress: newAddress },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Delivery address updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update address' });
  }
};
