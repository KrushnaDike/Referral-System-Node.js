import nodePlanModel from "../../../models/buyPlans";

const nodePlanServices = {

    nodePlanList: async (query) => {
        return await nodePlanModel.find(query);
    },

    nodePlan: async (query) => {
        return await nodePlanModel.findOne(query);
    },

}
module.exports = { nodePlanServices };