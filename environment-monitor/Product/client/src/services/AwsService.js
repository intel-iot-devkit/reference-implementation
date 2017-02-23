import moment from 'moment'
import CryptoJS from 'crypto-js'

class AwsService {

  getUrl(host, region, secretKey, accessKey) {
    // must use utc time
    var time = moment.utc()
    var dateStamp = time.format('YYYYMMDD')
    var amzdate = dateStamp + 'T' + time.format('HHmmss') + 'Z'
    var service = 'iotdevicegateway'
    var algorithm = 'AWS4-HMAC-SHA256'
    var method = 'GET'
    var canonicalUri = '/mqtt'

    var credentialScope = dateStamp + '/' + region + '/' + service + '/' + 'aws4_request'
    var canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256'
    canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(accessKey + '/' + credentialScope)
    canonicalQuerystring += '&X-Amz-Date=' + amzdate
    canonicalQuerystring += '&X-Amz-Expires=86400'
    canonicalQuerystring += '&X-Amz-SignedHeaders=host'

    var canonicalHeaders = 'host:' + host + '\n'
    var payloadHash = this.sha256('')
    var canonicalRequest = method + '\n' + canonicalUri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash
    console.log('canonicalRequest ' + canonicalRequest)

    var stringToSign = algorithm + '\n' +  amzdate + '\n' +  credentialScope + '\n' +  this.sha256(canonicalRequest)
    var signingKey = this.getSignatureKey(secretKey, dateStamp, region, service)
    console.log('stringToSign-------')
    console.log(stringToSign)
    console.log('------------------')
    console.log('signingKey ' + signingKey)
    var signature = this.sign(signingKey, stringToSign)

    canonicalQuerystring += '&X-Amz-Signature=' + signature
    var requestUrl = 'wss://' + host + canonicalUri + '?' + canonicalQuerystring
    return requestUrl
  }

  sign(key, msg){
    var hash = CryptoJS.HmacSHA256(msg, key)
    return hash.toString(CryptoJS.enc.Hex)
  }

  sha256(msg) {
    var hash = CryptoJS.SHA256(msg)
    return hash.toString(CryptoJS.enc.Hex)
  }

  getSignatureKey(key, dateStamp, regionName, serviceName) {
    var kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key)
    var kRegion = CryptoJS.HmacSHA256(regionName, kDate)
    var kService = CryptoJS.HmacSHA256(serviceName, kRegion)
    var kSigning = CryptoJS.HmacSHA256('aws4_request', kService)
    return kSigning
  }
}

export default AwsService