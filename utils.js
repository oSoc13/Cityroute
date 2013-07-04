/**
 * Creates a json meta representation containing error information
 * @param code the error code
 * @param an optional more specific error code (no html code)
 * @param error message
 * @return json representation of input
 */
exports.createErrorMeta = function (code, msg_code, msg_text) {
    return (
        {
            "code": code, "message":
            {
                "msg_code": msg_code, "msg_text": msg_text
            }
        }
    );
}

/**
 * Creates a json meta representation
 * @return json representation for 200 OK meta
 */
exports.createOKMeta = function () {
    return (
        {
            "code": 200, "message": {}
        }
    );
}