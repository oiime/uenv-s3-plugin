const crypto = require('crypto')
const AWS = require('aws-sdk')

function PluginS3 (methods, { tags, bucket, key, region, credentials, encryption } = {}) {
  if (!bucket) throw new Error('bucket is required')
  if (!key) throw new Error('key is required')

  this.__region = region
  this.__credentials = credentials
  this.__bucket = bucket
  this.__key = key
  this.__tags = tags

  Object.assign(this, methods)

  if (encryption) {
    if (!encryption.password) throw new Error('encryption requires a password')
    this.__encrypt = function (data) {
      const cipher = crypto.createCipher(encryption.cipher || 'aes192', encryption.password)
      return Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()])
    }
    this.__decrypt = function (buf) {
      const decipher = crypto.createDecipher(encryption.cipher || 'aes192', encryption.password)
      return Buffer.concat([decipher.update(buf), decipher.final()])
    }
  }
}

PluginS3.prototype.putObject = function (cb) {
  const params = {
    region: this.__region || 'us-east-1'
  }
  if (this.__credentials) {
    params.credentials = this.__credentials
  }
  const s3 = new AWS.S3(params)
  const body = this.__encrypt ? this.__encrypt(JSON.stringify(this.toJSON())) : Buffer.from(JSON.stringify(this.toJSON()))

  const putParams = { Body: body, Bucket: this.__bucket, Key: this.__key }
  if (cb) {
    return s3.putObject(putParams, cb)
  }
  return s3.putObject(putParams).promise()
}

PluginS3.prototype.getObject = function (cb) {
  const params = {
    region: this.__region || 'us-east-1'
  }
  if (this.__credentials) {
    params.credentials = new AWS.Credentials(this.__credentials)
  }
  const s3 = new AWS.S3(params)
  const getParams = { Bucket: this.__bucket, Key: this.__key }

  if (cb) {
    return s3.getObject(getParams, (err, data) => {
      if (err) return cb(err)

      try {
        const body = this.__decrypt ? this.__decrypt(data.Body) : data.Body.toString()
        this.assign(JSON.parse(body.toString()))
      } catch (err) {
        cb(err)
      }
    })
  }
  return s3.getObject(getParams).promise().then(data => {
    const body = this.__decrypt ? this.__decrypt(data.Body) : data.Body.toString()
    this.assign(JSON.parse(body.toString()))

    return Promise.resolve()
  })
}

module.exports = PluginS3
