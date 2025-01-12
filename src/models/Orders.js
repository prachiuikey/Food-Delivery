const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, default: uuidv4 },
    orderId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    items: [{ type: String, required: true }],
    deliveryTime: { type: Date, required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
});

module.exports = mongoose.model('Order', OrderSchema);
