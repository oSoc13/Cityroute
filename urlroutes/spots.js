exports.findAll = function (request, response) {
    response.send([{ name: 'spot1' }, { name: 'spot2' }, { name: 'spot' }]);
};

exports.findById = function (request, response) {
    response.send({ id: request.params.id, name: "spot1", description: "description" });
};