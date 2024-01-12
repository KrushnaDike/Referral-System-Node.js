import shoesSchema from "../../../models/shoes";
import workoutType from "../../../enums/workoutType"
import cycleSchema from "../../../models/cycle"
import userType from "../../../enums/userType";
import status from "../../../enums/status";

const shoesServices = {
  // addShoes: async (query) => {
  //   return await shoesSchema.create(query);
  // },


  // addCycle: async (query) => {
  //   return await cycleSchema.create(query);
  // },

   addShoes : async (query) => {
    console.log("Adding Shoes with Query:", query);
    try {
      const result = await shoesSchema.create(query);
      console.log("Shoes Added Successfully:", result);
      return result;
    } catch (error) {
      console.error("Error Adding Shoes:", error.message);
      throw error;
    }
  },
  
  addCycle : async (query) => {
    console.log("Adding Cycle with Query:", query);
    try {
      const result = await cycleSchema.create(query);
      console.log("Cycle Added Successfully:", result);
      return result;
    } catch (error) {
      console.error("Error Adding Cycle:", error.message);
      throw error;
    }
  },
  
  getShoes: async (query) => {
    return await shoesSchema.findOne(query);
  },
  findShoes: async (query) => {
    let bookDetails = await shoesSchema.findOne(query);
    if (bookDetails) {
      return bookDetails;
    } else {
      return [];
    }
  },
  findCycle: async (query) => {
    let cycleDetails = await cycleSchema.findOne(query);
    if (cycleDetails) {
      return cycleDetails;
    } else {
      return [];
    }
  },
  updateShoesQuantity: async (query, updateObj) => {
    return await shoesSchema.findOneAndUpdate(query, updateObj, { new: true });
  },
  updateBookQuantity1: async (query, updateObj) => {
    return await shoesSchema
      .findByIdAndUpdate(query, updateObj, { new: true })

  },
  paginateSearchShoesData: async (validatedBody) => {
    let query = {
      status: { $ne: status.DELETE },
      userType: { $ne: [userType.ADMIN, userType.USER] }

    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      userType1,
      status1,
      country,
    } = validatedBody;
    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: "i" } },   
      ];
    }
    if (status1) {
      query.status = status1;
    }
    if (userType1) {
      query.userType = userType1;
    }
    if (fromDate && !toDate) {
      // query.createdAt = { $gte: fromDate };
      query.createdAt = {
        $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
      };
    }
    if (!fromDate && toDate) {
      // query.createdAt = { $lte: toDate };
      query.createdAt = {
        $lte: new Date(
          new Date(toDate).toISOString().slice(0, 10) + "T23:59:59.999Z"
        ),
      };
    }
    if (fromDate && toDate) {
      query.$and = [
        // { createdAt: { $gte: fromDate } },
        // { createdAt: { $lte: toDate } },
        {
          createdAt: {
            $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
          },
        },
        {
          createdAt: {
            $lte: new Date(
              new Date(toDate).toISOString().slice(0, 10) + "T23:59:59.999Z"
            ),
          },
        },
      ];
    }
    let options = {
      page: page || 1,
      limit: limit || 10,
      sort: { createdAt: -1 },
    };
    return await shoesSchema.paginate(query, options);
  },

  paginateSearchCycleData: async (validatedBody) => {
    let query = {
      status: { $ne: status.DELETE },
      userType: { $ne: [userType.ADMIN, userType.USER] }

    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      userType1,
      status1,
      country,
    } = validatedBody;
    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: "i" } },   
      ];
    }
    if (status1) {
      query.status = status1;
    }
    if (userType1) {
      query.userType = userType1;
    }
    if (fromDate && !toDate) {
      // query.createdAt = { $gte: fromDate };
      query.createdAt = {
        $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
      };
    }
    if (!fromDate && toDate) {
      // query.createdAt = { $lte: toDate };
      query.createdAt = {
        $lte: new Date(
          new Date(toDate).toISOString().slice(0, 10) + "T23:59:59.999Z"
        ),
      };
    }
    if (fromDate && toDate) {
      query.$and = [
        // { createdAt: { $gte: fromDate } },
        // { createdAt: { $lte: toDate } },
        {
          createdAt: {
            $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
          },
        },
        {
          createdAt: {
            $lte: new Date(
              new Date(toDate).toISOString().slice(0, 10) + "T23:59:59.999Z"
            ),
          },
        },
      ];
    }
    let options = {
      page: page || 1,
      limit: limit || 10,
      sort: { createdAt: -1 },
    };
    return await cycleSchema.paginate(query, options);
  },

  paginateSearcBookData1: async (validatedBody) => {
    let query = {
      status: { $ne: status.DELETE },
    
     
      // userType: { $nin: [userType.ADMIN, userType.LIBRARIAN] }

    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      userType1,
      status1,
      country,
    } = validatedBody;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
       
       
      ];
    }
 
    if (country) {
      query.country = { $regex: country, $options: "i" };
    }
    if (status1) {
      query.status = status1;
    }
    if (userType1) {
      query.userType = userType1;
    }
    if (fromDate && !toDate) {
      // query.createdAt = { $gte: fromDate };
      query.createdAt = {
        $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
      };
    }
    if (!fromDate && toDate) {
      // query.createdAt = { $lte: toDate };
      query.createdAt = {
        $lte: new Date(
          new Date(toDate).toISOString().slice(0, 10) + "T23:59:59.999Z"
        ),
      };
    }
    if (fromDate && toDate) {
      query.$and = [
        // { createdAt: { $gte: fromDate } },
        // { createdAt: { $lte: toDate } },
        {
          createdAt: {
            $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
          },
        },
        {
          createdAt: {
            $lte: new Date(
              new Date(toDate).toISOString().slice(0, 10) + "T23:59:59.999Z"
            ),
          },
        },
      ];
    }
    let options = {
      page: page || 1,
      limit: limit || 10,
      sort: { createdAt: -1 },
    };
    return await shoesSchema.paginate(query, options);
  },

  deleteShoes: async (query) => {
    return await shoesSchema.deleteOne(query);
  },


  deleteCycle: async (query) => {
    return await cycleSchema.deleteOne(query);
  },

};

module.exports = { shoesServices };
