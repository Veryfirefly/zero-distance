const openAboutWindow = require('about-window').default
const path = require('path')

const create = () => openAboutWindow({
    icon_path: path.join(__dirname, 'icon.png'),
    package_json_dir: path.resolve(__dirname, '/../../../'),
    copyright: 'Copyright (c) 2020 XiaoYu',
    homepage: 'http://www.likeu.cool'
})

module.exports = { create }