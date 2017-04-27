const crypto = require('crypto');
const request = require('request');
const fs = require('fs');
const debug = require('debug')('jssdk');

function JSSDK(appId, appSecret) {
    this.appId = appId
    this.appSecret = appSecret
}

JSSDK.prototype = {
    getSignPackage: function (url) {
        const jsapiTicket = this.getJsApiTicket();
        const nonceStr = this.createNonceStr()
        const timestamp = Math.random(Date.now() / 1000)
        // 这里参数的顺序要按照 key 值 ASCII 码升序排序
        const _string = `jsapi_ticket=${jsApiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
        /*2）将三个参数字符串拼接成一个字符串进行sha1加密*/
        const hash = crypto.createHash('sha1');
        const signatrue = hash.update(_string).digest('hex');
        return {
            url: url,
            timestamp: timestamp,
            signatrue: signatrue,
            appId: this.appId,
            noncestr: nonceStr
        }
    },
    getJsApiTicket: function (Callback) {
        const intance = this
        const cachefile = 'jsapiticket.json'
        const data = intance.readCacheFile(cachefile)
        const time = Math.round(Date.now() / 1000)

        if (typeof data.expireTime === 'undefined' || data.expireTime < time) {
            intance.getAccessToken(function (error, accessToken) {
                const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=${accessToken}`;

                request.get(url, function (err, res, body) {
                    if (err) {
                        debug('getJsApiTicket.request.error: ', err, url)
                        return Callback(err, null);
                    }

                    debug('getJsApiTicket.request.body: ', body)
                    try {
                        const data = JSON.parse(body)
                        //求到的数据保存
                        intance.writCacheFile(cachefile, {
                            expireTime: Math.round(Date.now() / 1000) + 7200,
                            jsApiTicket: data.ticket
                        })
                        Callback(null, data.ticket)

                    } catch (e) {
                        Callback(e, null)
                    }
                })
            })
        } else {
            debug('getJsApiTicket: form cache')
            Callback(null, data.jsApiTicket)
        }
    },
    getAccessToken: function () {
        const intance = this
        const cachefile = 'getaccesstoken.json'
        const data = intance.readCacheFile(cachefile)
        const time = Math.round(Date.now() / 1000)

        console.log(typeof data.expireTime);
        if (data.expireTime < time) {
            debug('getAccessToken: form server')
            const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${ this.appId}&secret=${this.appSecret}`;

            request.get(url, function (err, res, body) {
                if (err) {
                    debug('getJsApiTicket.request.error: ', err, url)
                    return Callback(err, null);
                }

                debug('getJsApiTicket.request.body: ', body)
                try {
                    const data = JSON.parse(body)
                    //求到的数据保存
                    intance.writCacheFile(cachefile, {
                        expireTime: Math.round(Date.now() / 1000) + 7200,
                        jsApiTicket: data.ticket
                    })
                    Callback(null, data.ticket)

                } catch (e) {
                    Callback(e, null)
                }
            })
        } else {
            debug('getAccessToken: form cache')
            Callback(null, data.jsApiTicket)
        }
    },
    createNonceStr: function () {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const _length = chars.length
        let str = ''
        for (let i = 0; i < _length; i++) {
            str += chars.substr(Math.round(Math.random() * _length), 1)
        }
        return str
    },
    //读取缓存文件
    readCacheFile: function (filename) {
        try {
            return JSON.parse(fs.readFileSync(filename))
        } catch (err) {
            debug('read file %s failed: %s', filename, err)
        }
    },
    //写缓存文件
    writCacheFile: function (filename, data) {
        return fs.writeFileSync(filename, JSON.stringify(data))
    }

};

module.exports = new JSSDK('wx2b3aaec931ae33f7', '60771f3aea937fca3c2d051c8fc84467')


