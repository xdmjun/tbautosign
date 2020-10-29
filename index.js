'use strict'
const fetch = require('node-fetch')
const FormData = require('form-data')
// API_URL
const LIKIE_URL = 'https://tieba.baidu.com/mo/q/newmoindex'
const TBS_URL = 'http://tieba.baidu.com/dc/common/tbs'
const SIGN_URL = 'https://tieba.baidu.com/sign/add'
const HEADERINFO = {
  Host: 'tieba.baidu.com',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
}
const SIGN_DATA = {
  _client_type: '2',
  _client_version: '9.7.8.0',
  _phone_imei: '000000000000000',
  model: 'MI+5',
  net_type: '1',
}
// VARIABLE NAME
var COOKIE = 'Cookie',
  BDUSS = 'BDUSS',
  TBS = 'tbs',
  PAGE_NO = 'page_no',
  ONE = '1',
  TIMESTAMP = 'timestamp',
  DATA = 'data',
  FID = 'fid',
  SIGN_KEY = 'tiebaclient!!!',
  UTF8 = 'utf-8',
  SIGN = 'sign',
  KW = 'kw'

var get_tbs = function (bduss) {
  var headerInfo = Object.assign(HEADERINFO, { COOKIE: `BDUSS=${bduss}` })
  console.info('获取tbs开始')
  return new Promise((res, rej) => {
    fetch(TBS_URL, {
      method: 'GET',
      headers: headerInfo,
    })
      .then(function (response) {
        return response.json()
      })
      .catch((e) => {
        console.error('获取tbs出错' + e)
        rej(e)
      })
      .then((r) => {
        res(r[TBS])
        console.info('获取tbs成功')
      })
  })
}

let get_favorite = function (bduss) {
  var headerInfo = Object.assign(HEADERINFO, { COOKIE: `BDUSS=${bduss}` })
  console.info('获取关注的贴吧开始')
  return new Promise((res, rej) => {
    fetch(LIKIE_URL, {
      method: 'GET',
      headers: headerInfo,
    })
      .then(function (response) {
        return response.json()
      })
      .catch((e) => {
        console.error('获取关注的贴吧出错' + e)
        rej([])
      })
      .then((r) => {
        res(r.data['like_forum'])
        console.info('获取关注的贴吧结束')
      })
  })
}

let sign = function (bduss, tbs, fid, kw) {
  var headerInfo = Object.assign(HEADERINFO, { COOKIE: `BDUSS=${bduss}` })
  let formData = new FormData()
  formData.append('ie', 'utf-8')
  formData.append('kw', kw)
  formData.append('ie', tbs)
  return new Promise((res, rej) => {
    setTimeout(() => {
      console.info('开始签到贴吧：' + kw)
      fetch(SIGN_URL, {
        method: 'POST',
        headers: headerInfo,
        body: formData,
      })
        .then(function (response) {
          return response.json()
        })
        .catch((e) => {
          rej(null)
          console.error(`${kw}吧 签到失败。 ${e}`)
        })
        .then((r) => {
          if (r['no'] == '1101') {
            res(`${kw}吧 已经签到过了。`)
            return
          }
          if (r['no'] == '0') {
            res(`${kw}吧 签到成功`)
            return
          }
          if (r['no'] == '2150040') {
            res('break')
            return
          }
          res(`${kw}吧 签到失败。${r['error']}`)
        })
    }, 5000)
  })
}

function run(bduss) {
  Promise.all([get_tbs(bduss), get_favorite(bduss)]).then(async (res) => {
    let tbs = res[0],
      favorite = res[1]
    for (let i = 0; i < favorite.length; i++) {
      let res = await sign(
        bduss,
        tbs,
        favorite[i]['forum_id'],
        favorite[i]['forum_name']
      )
      if (res == 'break') {
        console.log(
          `需要验证码，终止签到, 剩下${favorite.length - i}个贴吧未签到`
        )
        return
      }
      console.log(res)
      if (i == favorite.length) {
        console.log('签到完成')
      }
    }
  })
}

var args = process.env.BDUSS
var param = args.split('&&')
for (let i = 0; i < param.length; i++) {
  let bduss = param[i]
  run(bduss)
}
