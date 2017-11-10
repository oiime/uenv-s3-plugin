## about

`uenv-s3-plugin` provides a plugin to store and retrieve configuration from AWS S3 buckets, it also allows on-the-fly encryption of the configuration before it is stored

## requirements
[`uenv`](https://github.com/oiime/uenv)

## installation
```bash
npm install --save uenv-s3-plugin
```

## by example

```javascript
const uenv = require('uenv')
const uenvs3 = require('uenv-s3-plugin')

uenv.plugin('s3', uenvs3)

// import enviorment variables into configuration
const s3 = uenv.s3({ bucket: 's3bucket', key: 'stored_path', encryption: { password: '123456' } })

// using callback
s3.getObject(err => {
  // data now available
  uenv.get('key.from.s3')
  // store changes in S3
  uenv.set('foo', 'bar')
  s3.putObject()
})

// using promises
s3.getObject().then(() => {
  uenv.get('key.from.s3')
})

// assign results to a child
const child = uenv.s3Child('child.place' { bucket: 's3bucket', key: 'stored_path', encryption: { password: '123456' } })

child.getObject().then(() => {
  uenv.get('child.place.foo') // bar
})

```

## API

#### uenv.s3({ bucket, key, region, credentials, encryption })

* bucket - S3 bucket name
* key - S3 key name
* region - AWS Region, defaults to us-east-1
* credentials - provide alternative credentials, passes arguments to AWS.Credentials(), eg `{ accessKeyId: '', secretAccessKey: ''}`
* encryption - encrypts data before storage, defaults to aes192 eg: `{ cipher: 'aes192', password: '123456' }`

bucket, key, region, credentials, encryption

#### s3.getObject(cb)

Gets configuration from S3, if cb is not provided, a promise would be returned

#### s3.putObject(cb)

Sets configuration in S3, if cb is not provided, a promise would be returned

License: MIT
