const axios = require('axios')
const cheerio = require('cheerio')
const config = require('./constants')


// Get Latest Anime Torrents From HorribleSubs.info [title,poster,plot,torrents(all quality)]
const getLatest = async () => {
  const latestLinks = await getAnimeLinks(config.LATEST_URL)
  const result = await getAnimeData(latestLinks)
  return JSON.stringify(result)
}
 
// Search For Animes [not required to specify quality]
// Check test.js For Examples
const searchAnime = async query => {
  const searchLinks = await getAnimeLinks(config.SEARCH_URL + query)
  const result = await getAnimeData(searchLinks)
  return JSON.stringify(result)
}

const getAnimeData = async links => {
  const results = []
  for (const i in links) {
    const res = await axios.get(links[i])
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
    results.push({
      title: title,
      hqposter: image,
      plot: plot,
      eps: data
    })
  }
  return results
}
const getMagnets = async showId => {
  const results = []
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
    results.push({
      title: epName,
      '1080p': ten80p,
      '720p': seven20p,
      '480p': four80p
    })
  }
  return results
}
const getAnimeLinks = async url => {
  const animeLinks = []
  let animeRes = await axios.get(url)
  if (animeRes.status != 200)
    return Error('[HorribleApi]: Could not reach horriblesubs.info')
  const $ = cheerio.load(animeRes.data)
  const li = $('li').get()
  for (const i in li)
    animeLinks.push(config.BASE_URL + li[i].children[0].attribs.href)
  return animeLinks
}


module.exports = {
  getLatest,
  searchAnime
}
