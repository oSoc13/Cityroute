// @author: Thomas Stockx
// @copyright: OKFN Belgium

// return a json with like every spot
exports.findAll = function (request, response) {
    response.send([{ name: 'spot1' }, { name: 'spot2' }, { name: 'spot' }]);
};

// return a json by spot id
exports.findById = function (request, response) {
    response.send({ id: request.params.id, name: "spot1", description: "description" });
};