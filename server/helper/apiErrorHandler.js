const apiErrorhandler = (err, req, res, next) => {
    console.log(err, "Error From Middleware.")
    console.log(err.name, err, "Error  nsjhckFrom Middleware.")

    if (err.isApiError) {
        res.status(err.responseCode).json({
            responseCode: err.responseCode,
            responseMessage: err.responseMessage,
        });
        return;
    }
    if (err.message == 'Validation error') {
        res.status(502).json({
            code: 502,
            responseMessage: err.original.message,
        });
        return;
    }
    // if (err.name == "ValidationError") {
    //     res.status(400).json({
    //         code: 400,
    //         responseMessage: err.details[0].message
    //     });
    //     return;
    // }
    console.log("27")
    res.status(err.code || 500).json({
        responseCode: err.code || 500,
        responseMessage: err.message,
    });
    return;
};
module.exports = apiErrorhandler;