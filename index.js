const axios = require('axios')
const cheerio = require('cheerio')
const config = require('./constants')

const getLatest = async () => {
  const result = []
  const latestLinks = await getLatestLinks()
  for (const i in latestLinks) {
    const res = await axios.get(latestLinks[i])
    if (res.status != 200)
      return Error('[HorribleApi]: Could not reach horriblesubs.info')
    const $ = cheerio.load(res.data, { xmlMode: true })
    const regex = /(?<= = )(.*)(?=;)/gm
    const showId = regex.exec($('script:not([src])')[2].children[0].data)[0]
    const title = $('.entry-title').text()
    const plot = $('.series-desc  p').text()
    let image = $('.series-image')[0].children[1].attribs.src
    if (!image.includes('horriblesubs')) {
      image = config.BASE_URL + image
    }
    const data = await getMagnets(showId)
    result.push({
      title: title,
      hqposter: image,
      plot: plot,
      eps: data
    })
  }
  return result
}
const getMagnets = async showId => {
  const data = []
  const res = await axios.get(config.TORRENT_URL + showId)
  if (res.status != 200)
    return Error('[HorribleApi]: Could not reach horriblesubs.info')
  const $ = cheerio.load(res.data)
  const contList = $('.rls-info-container').get()
  for (var i in contList) {
    const epName = `${contList[i].children[0].children[1].data}${contList[i].children[0].children[2].children[0].data}`
    const rsLink = contList[i].children[1]
    const four80p = rsLink.children[0].children[1].children[0].attribs.href
    const seven20p = rsLink.children[1].children[1].children[0].attribs.href
    const ten80p = rsLink.children[2].children[1].children[0].attribs.href
    data.push({
      title: epName,
      '1080p': ten80p,
      '720p': seven20p,
      '480p': four80p
    })
  }
  return data
}
const getLatestLinks = async () => {
  const latestLinks = []
  const latestRes = await axios.get(config.LATEST_URL)
  if (latestRes.status != 200)
    return Error('[HorribleApi]: Could not reach horriblesubs.info')

  const $ = cheerio.load(latestRes.data)
  const li = $('li').get()
  for (const i in li) {
    latestLinks.push(config.BASE_URL + li[i].children[0].attribs.href)
  }
  return latestLinks
}
module.exports = {
  getLatest
}
