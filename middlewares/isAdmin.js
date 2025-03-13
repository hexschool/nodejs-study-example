const FORBIDDEN_MESSAGE = '你沒有權限存取此資源'
const PERMISSION_DENIED_STATUS_CODE = 401

function generateError (status = PERMISSION_DENIED_STATUS_CODE, message = FORBIDDEN_MESSAGE) {
  const error = new Error(message)
  error.status = status
  return error
}

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    next(generateError())
    return
  }
  next()
}
