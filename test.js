const horribleApi = require('./index')

horribleApi.getLatest().then(console.log)
// Find And Gets The Latest Anime Releases With All Quality, Description And Images

horribleApi.searchAnime('boku').then(console.log)
// Searchs For Anime And Return Results With All Quality, Description And Images
