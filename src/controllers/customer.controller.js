
import { Customer } from "../models/customer.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addCustomer = asyncHandler(async (req, res) => {
    const { fullname, mobile, address, data } = req.body;

    if (!fullname || !mobile || !address || !Array.isArray(data)) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }


    const customer = new Customer({
        fullname,
        mobile,
        address,
        data
    });

    try {
        // Save the customer to the database
        const savedCustomer = await customer.save();

        const response = new apiResponse(200, savedCustomer, "Customer created successfully");

        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create customer', error });
    }
});

const getAllCustomers = asyncHandler(async (req, res) => {
    try {
      const customers = await Customer.find();
  
     return res.status(200).json(new apiResponse(200, customers, 'All customers fetched successfully'));
  
    } catch (error) {
      return res.status(500).json(new apiResponse(500, null, 'Failed to fetch customers'));
    }
  });

const getCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json(new apiResponse(400, null, 'Customer ID is required'));
    }

    try {
        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json(new apiResponse(404, null, 'Customer not found'));
        }

        return res.status(200).json(new apiResponse(200, customer, 'Customer details fetched successfully'));

    } catch (error) {
        return res.status(500).json(new apiResponse(500, null, 'Failed to fetch customer details'));
    }
});



const updateCustomerData = asyncHandler(async (req, res) => {
    const { id } = req.params; 
    const { data } = req.body; 
  
    if (!id || !Array.isArray(data)) {
      return res.status(400).json(new apiResponse(400, null, 'Customer ID and data are required'));
    }
  
    try {
      const customer = await Customer.findById(id);
  
      if (!customer) {
        return res.status(404).json(new apiResponse(404, null, 'Customer not found'));
      }
  
      customer.data = data;
  
      const updatedCustomer = await customer.save();
  
      return res.status(200).json(new apiResponse(200, updatedCustomer, 'Customer data updated successfully'));
  
    } catch (error) {
      return res.status(500).json(new apiResponse(500, null, 'Failed to update customer data'));
    }
  });












export {
    addCustomer,
    getAllCustomers,
    getCustomer,
    updateCustomerData,

};