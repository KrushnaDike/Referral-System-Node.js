const userType = require("../enums/userType")

module.exports = {
    client_sign_up:async(data)=>{
      let msg=`Hi ${data.name}, Thank you for signing up. We look forward to serving you.`
      let title=`Sign Up`
      let obj={
          userId: data.user._id,
          title: title,
          body: msg,
          notificationType:"Sign Up",
          userType:userType.USER,
      }
      return {
        deviceToken:null,
        title:title,
        body:msg,
        notifyObj:obj
      }
    },
    client_sign_up_admin:async(data)=>{
        let msg=`Hi, ${data.name} has signed up.`
        let title=`Sign Up`
        let obj={
            title: title,
            body: msg,
            notificationType:"Sign Up",
            userType:userType.ADMIN,
        }
        return {
          deviceToken:null,
          title:title,
          body:msg,
          notifyObj:obj
        }
  
    },
    order_placement_client:async(data)=>{
        let msg=`Hi ${data.name}, You have successfully made an order. Order ID ${data.orderID}`
        let title=`Order placement` 
    },
    order_placement_admin:async(data)=>{
        let msg=`Hi, You have received an order from ${data.name}. Order ID ${data.orderID}`
        let title=`Order placement` 
    },
    status_update_Under_review:async(data)=>{
        let msg=`Hi ${data.name}, your order is under review. We will call you shortly`
        let title=`Status update under review` 
        let obj={
            userId: data.user._id,
            title: title,
            body: msg,
            notificationType:"status_update_Under_review",
            userType:userType.USER,
        }
        return {
          deviceToken:data.user.deviceToken,
          title:title,
          body:msg,
          notifyObj:obj
        }
    },
    status_update_Assigned:async(data)=>{
        let msg=`Hi ${data.name}, your order has been assigned to ${data.deliveryName}.`
        let title=`Status update assigned` 
    },
    status_update_Started_off:async(data)=>{
        let msg=`Hi ${data.name}, your expert has started off.`
        let title=`Status update started off` 
        let obj={
            userId: data.user._id,
            title: title,
            body: msg,
            notificationType:"status_update_Started_off",
            userType:userType.USER,
        }
        return {
          deviceToken:data.user.deviceToken,
          title:title,
          body:msg,
          notifyObj:obj
        }
    },
    status_update_Dispatched:async(data)=>{
        let msg=`Hi ${data.name}, your goods have been dispatched and will be delivered by ${data.deliveryName}`
        let title=`Status update dispatched` 
        let obj={
            userId: data.user._id,
            title: title,
            body: msg,
            notificationType:"status_update_Dispatched",
            userType:userType.USER,
        }
        return {
          deviceToken:data.user.deviceToken,
          title:title,
          body:msg,
          notifyObj:obj
        }
    },
    status_update_Completed:async(data)=>{
        let msg=`Hi ${data.name}, your order has been completed. Thank you for trusting us.`
        let title=`Status update completed` 
        let obj={
            userId: data.user._id,
            title: title,
            body: msg,
            notificationType:"status_update_Completed",
            userType:userType.USER,
        }
        return {
          deviceToken:data.user.deviceToken,
          title:title,
          body:msg,
          notifyObj:obj
        }
    },
    status_update_Delivered:async(data)=>{
        let msg=`Hi ${data.name}, your order has been delivered. Thank you for trusting us.`
        let title=`Status update delivered` 
        let obj={
            userId: data.user._id,
            title: title,
            body: msg,
            notificationType:"status_update_Delivered",
            userType:userType.USER,
        }
        return {
          deviceToken:data.user.deviceToken,
          title:title,
          body:msg,
          notifyObj:obj
        }
    },
    order_cancellation_by_client:async(data)=>{
        let msg=`Hi, Order ID ${data.orderID} has been cancelled by ${data.name}`
        let title=` Order cancellation` 
        let obj={
            userId: data.user._id,
            title: title,
            body: msg,
            notificationType:"order_cancellation_by_client",
            userType:userType.ADMIN,
        }
        return {
          deviceToken:null,
          title:title,
          body:msg,
          notifyObj:obj
        }
    },
    order_cancellation_by_admin:async(data)=>{
        let msg=`Hi, your order has been cancelled. Please contact admin for more information.`
        let title=` Order cancellation`
    }
}