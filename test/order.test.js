
const Order = require('../src/models/Orders'); // Your Order model

const { v4: uuidv4 } = require('uuid');
jest.mock('../src/models/Orders'); // Mock the Order model
jest.mock('uuid', () => ({ v4: jest.fn() }));
const { 
    placeOrder,
    viewOrderByEmail,
    viewAllOrders,
    cancelOrder,
    modifyAddress
 } = require('../src/controller/orderController');



describe('Order API Endpoints', () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          deliveryAddress: '123 Main St',
          items: ['item1', 'item2'],
        },
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      uuidv4.mockReturnValue('mocked-uuid');
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    console.log(new Date());
    it('should successfully place an order with valid data', async () => {
      const mockSave = jest.fn().mockResolvedValue({
        orderId: 'mocked-uuid',
        name: 'John Doe',
        email: 'johndoe@example.com',
        deliveryAddress: '123 Main St',
        items: ['item1', 'item2'],
        deliveryTime: "2025-01-12T18:55:28.212Z",
      });
      Order.mockImplementation(() => ({
        save: mockSave,
      }));
  
      await placeOrder(req, res);
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      
    });
  
    it('should return 500 if database save fails', async () => {
      const mockSave = jest.fn().mockRejectedValue(new Error('Database error'));
      Order.mockImplementation(() => ({
        save: mockSave,
      }));
  
      await placeOrder(req, res);
  
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to place order' });
    });
});

describe('viewOrderByEmail', () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        params: {
          email: 'test@example.com',
        },
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should successfully return active orders for a valid email', async () => {
      const mockOrders = [
        { id: 1, email: 'test@example.com', status: 'active', items: ['item1'] },
        { id: 2, email: 'test@example.com', status: 'active', items: ['item2'] },
      ];
      Order.find.mockResolvedValue(mockOrders);
  
      await viewOrderByEmail(req, res);
  
      expect(Order.find).toHaveBeenCalledWith({ email: 'test@example.com', status: 'active' });
      expect(res.status).not.toHaveBeenCalledWith(404); // Ensure no 404 response
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });
  
    it('should return 404 if no active orders are found for the email', async () => {
      Order.find.mockResolvedValue([]); // Simulate no orders found
  
      await viewOrderByEmail(req, res);
  
      expect(Order.find).toHaveBeenCalledWith({ email: 'test@example.com', status: 'active' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No orders found' });
    });
  
    it('should return 500 if the database query fails', async () => {
      Order.find.mockRejectedValue(new Error('Database error')); // Simulate database error
  
      await viewOrderByEmail(req, res);
  
      expect(Order.find).toHaveBeenCalledWith({ email: 'test@example.com', status: 'active' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch order details' });
    });
  });

  describe('viewAllOrders', () => {
    let res;
  
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should successfully return all active orders', async () => {
      const mockOrders = [
        { id: 1, email: 'user1@example.com', status: 'active', items: ['item1'] },
        { id: 2, email: 'user2@example.com', status: 'active', items: ['item2'] },
      ];
      Order.find.mockResolvedValue(mockOrders);
  
      await viewAllOrders({}, res);
  
      expect(Order.find).toHaveBeenCalledWith({ status: 'active' });
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });
  
    it('should return 500 if the database query fails', async () => {
      Order.find.mockRejectedValue(new Error('Database error'));
  
      await viewAllOrders({}, res);
  
      expect(Order.find).toHaveBeenCalledWith({ status: 'active' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch all orders' });
    });
  });

  describe('cancelOrder', () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        body: {
          email: 'test@example.com',
          orderId: 'mockOrderId',
        },
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should successfully cancel an order', async () => {
      const mockOrder = {
        _id: 'mockOrderId',
        email: 'test@example.com',
        status: 'cancelled',
        items: ['item1'],
      };
      Order.findOneAndUpdate.mockResolvedValue(mockOrder);
  
      await cancelOrder(req, res);
  
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'mockOrderId', email: 'test@example.com' },
        { status: 'cancelled' },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order cancelled successfully',
        order: mockOrder,
      });
    });
  
    it('should return 404 if the order is not found', async () => {
      Order.findOneAndUpdate.mockResolvedValue(null);
  
      await cancelOrder(req, res);
  
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'mockOrderId', email: 'test@example.com' },
        { status: 'cancelled' },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
  
    it('should return 500 if the database query fails', async () => {
      Order.findOneAndUpdate.mockRejectedValue(new Error('Database error'));
  
      await cancelOrder(req, res);
  
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'mockOrderId', email: 'test@example.com' },
        { status: 'cancelled' },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to cancel order' });
    });
  });
  

  describe('modifyAddress', () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        body: {
          email: 'test@example.com',
          orderId: 'mockOrderId',
          newAddress: '456 New Address, Cityville',
        },
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should successfully update the delivery address of an order', async () => {
      const mockOrder = {
        _id: 'mockOrderId',
        email: 'test@example.com',
        deliveryAddress: '456 New Address, Cityville',
        status: 'active',
      };
      Order.findOneAndUpdate.mockResolvedValue(mockOrder);
  
      await modifyAddress(req, res);
  
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'mockOrderId', email: 'test@example.com' },
        { deliveryAddress: '456 New Address, Cityville' },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Delivery address updated successfully',
        order: mockOrder,
      });
    });
  
    it('should return 404 if the order is not found', async () => {
      Order.findOneAndUpdate.mockResolvedValue(null); // Simulate no order found
  
      await modifyAddress(req, res);
  
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'mockOrderId', email: 'test@example.com' },
        { deliveryAddress: '456 New Address, Cityville' },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
  
    it('should return 500 if the database query fails', async () => {
      Order.findOneAndUpdate.mockRejectedValue(new Error('Database error')); // Simulate database error
  
      await modifyAddress(req, res);
  
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'mockOrderId', email: 'test@example.com' },
        { deliveryAddress: '456 New Address, Cityville' },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update address' });
    });
  });