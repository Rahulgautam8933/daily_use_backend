
import mongoose from "mongoose";
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
    let { page, limit, searchQuery } = req.query;
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const skip = (page - 1) * limit;

    let query = {};

    if (searchQuery) {
      query = {
        $or: [
          { fullname: { $regex: searchQuery, $options: "i" } },
          { mobile: { $regex: searchQuery, $options: "i" } },
          { address: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const totalCount = await Customer.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const customers = await Customer.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: 200,
      data: customers,
      message: 'All customers fetched successfully',
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
      },
    });

  } catch (error) {
    console.error(error); 
    return res.status(500).json({
      status: 500,
      data: null,
      message: 'Failed to fetch customers',
    });
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


const updateCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
  
    try {
      // Validate the incoming data if needed
      if (!updateData) {
        return res.status(400).json(new apiResponse(400, null, 'No update data provided'));
      }
  
      // Find the customer by ID and update their details
      const updatedCustomer = await Customer.findByIdAndUpdate(id, updateData, {
        new: true,  // Return the updated document
        runValidators: true  // Run schema validation
      });
  
      if (!updatedCustomer) {
        return res.status(404).json(new apiResponse(404, null, 'Customer not found'));
      }
  
      return res.status(200).json(new apiResponse(200, updatedCustomer, 'Customer updated successfully'));
    } catch (error) {
      console.error('Error updating customer:', error);
      return res.status(500).json(new apiResponse(500, null, 'Failed to update customer'));
    }
  });


const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Find the customer by ID and delete the record
    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res.status(404).json(new apiResponse(404, null, 'Customer not found'));
    }

    return res.status(200).json(new apiResponse(200, deletedCustomer, 'Customer deleted successfully'));
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json(new apiResponse(500, null, 'Failed to delete customer'));
  }
});


const updateCustomerData = asyncHandler(async (req, res) => {
    try {
      const customerId = req.params.id; 
      const newData = req.body; 
  
      if (!newData.date || !newData.qty || !newData.amount) {
        return res.status(400).json(new apiResponse(400, null, 'Invalid data format'));
      }
  
      const customer = await Customer.findById(customerId);
  
      if (!customer) {
        return res.status(404).json(new apiResponse(404, null, 'Customer not found'));
      }
  
      newData._id = new mongoose.Types.ObjectId();
  
      customer.data.push(newData);
  
      const updatedCustomer = await customer.save();
  
      return res.status(200).json(new apiResponse(200, updatedCustomer, 'Customer data updated successfully'));
  
    } catch (error) {
      console.error('Error updating customer data:', error);
      return res.status(500).json(new apiResponse(500, null, 'Failed to update customer data'));
    }
  });

const updateCustomerDataItem = asyncHandler(async (req, res) => {
    try {
      const { customerId, dataId } = req.params; // Extract customer ID and data ID from request parameters
      const updatedData = req.body; // Extract updated data from request body
  
      // Validate the updated data if needed
      if (!updatedData.date || !updatedData.qty || !updatedData.amount) {
        return res.status(400).json(new apiResponse(400, null, 'Invalid data format'));
      }
  
      // Find the customer by ID
      const customer = await Customer.findById(customerId);
  
      if (!customer) {
        return res.status(404).json(new apiResponse(404, null, 'Customer not found'));
      }
  
      // Find the index of the data item to update
      const dataIndex = customer.data.findIndex(item => item._id.toString() === dataId);
  
      if (dataIndex === -1) {
        return res.status(404).json(new apiResponse(404, null, 'Data item not found'));
      }
  
      // Update the data item
      customer.data[dataIndex] = { ...customer.data[dataIndex].toObject(), ...updatedData };
  
      // Save the updated customer document
      const updatedCustomer = await customer.save();
  
      // Send a success response
      return res.status(200).json(new apiResponse(200, updatedCustomer, 'Customer data item updated successfully'));
  
    } catch (error) {
      console.error('Error updating customer data item:', error);
      return res.status(500).json(new apiResponse(500, null, 'Failed to update customer data item'));
    }
  });

const deleteCustomerDataItem = asyncHandler(async (req, res) => {
    try {
      const { customerId, dataId } = req.params; // Extract customer ID and data ID from request parameters
  
      // Find the customer by ID
      const customer = await Customer.findById(customerId);
  
      if (!customer) {
        return res.status(404).json(new apiResponse(404, null, 'Customer not found'));
      }
  
      // Find the index of the data item to delete
      const dataIndex = customer.data.findIndex(item => item._id.toString() === dataId);
  
      if (dataIndex === -1) {
        return res.status(404).json(new apiResponse(404, null, 'Data item not found'));
      }
  
      // Remove the data item from the array
      customer.data.splice(dataIndex, 1);
  
      // Save the updated customer document
      const updatedCustomer = await customer.save();
  
      // Send a success response
      return res.status(200).json(new apiResponse(200, updatedCustomer, 'Customer data item deleted successfully'));
  
    } catch (error) {
      console.error('Error deleting customer data item:', error);
      return res.status(500).json(new apiResponse(500, null, 'Failed to delete customer data item'));
    }
  });




const getTotalIncome = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 400,
        message: 'Please provide both startDate and endDate',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        status: 400,
        message: 'endDate must be greater than or equal to startDate',
      });
    }

    const matchQuery = {
      "data.date": {
        $gte: start,
        $lte: end,
      },
    };

    if (customerId) {
      matchQuery._id = new mongoose.Types.ObjectId(customerId);   }

    const totalAmount = await Customer.aggregate([
      {
        $unwind: "$data",   },
      {
        $match: matchQuery,  },
      {
        $group: {
          _id: null,
          total: { $sum: "$data.amount" },  },
      },
    ]);

    const total = totalAmount.length > 0 ? totalAmount[0].total : 0;

    return res.status(200).json({
      status: 200,
      totalAmount: total,
      message: `Total amount calculated from ${startDate} to ${endDate}${customerId ? ` for customer ${customerId}` : ''}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to calculate total amount',
    });
  }
});






export {
    addCustomer,
    getAllCustomers,
    getCustomer,
    updateCustomerData,
    updateCustomerDataItem,
    deleteCustomerDataItem,
    updateCustomer,
    deleteCustomer, 
    getTotalIncome,

};