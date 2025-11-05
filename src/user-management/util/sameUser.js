function sameUser(req, id) {
  return req.payload.id == id;
}

module.exports = sameUser;
