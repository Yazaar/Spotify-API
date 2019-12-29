let data
if (true) {

    //JavaScript file to communicate with the spotify API
    //JavaScript file to control the spotify overlay

    let newRequest = function() {
        let xml = new XMLHttpRequest()
        xml.onreadystatechange = () => {
            if (xml.readyState == 4) {
                if (xml.response == '') {
                    if (document.getElementById('title').innerHTML !== 'Connected to spotify') {
                        document.getElementById('title').innerHTML = 'Connected to spotify'
                        document.getElementById('author').innerHTML = 'Start playing a song to get started'
                        checkTickers()
                    }
                } else if (JSON.parse(xml.response).error) {
                    if(data.refresh_token === null) {
                        window.location = window.location.origin + window.location.pathname
                    } else {
                        refreshToken()
                    }
                } else {
                    updateData(JSON.parse(xml.response))
                }
            }
        }
        xml.open('get', 'https://api.spotify.com/v1/me/player/currently-playing', true)
        xml.setRequestHeader('Authorization', 'Bearer ' + data.access_token)
        xml.send()
    }

    let  updateData = function(xml) {
        if (xml.currently_playing_type != 'track') {
            return
        }
        document.getElementById('time').style.width = xml.progress_ms / xml.item.duration_ms * 100 + '%'
        if (document.getElementById('title').innerHTML != xml.item.name) {
            changeData(xml)
        }
    }

    let  changeData = function(xml) {
        document.getElementById('title').innerHTML = xml.item.name

        let artists = ''
        for (let i of xml.item.artists) {
            if (artists == '') {
                artists = i.name
            } else {
                artists += ', ' + i.name
            }
        }
        document.getElementById('author').innerHTML = artists
        if (xml.item.album.images.length > 0) {
            document.querySelector('#left img').src = xml.item.album.images[xml.item.album.images.length - 2].url
        } else {
            document.querySelector('#left img').src = './blank.png'
        }
        document.getElementById('time').style.background = generateRGB()
        checkTickers()
    }

    let checkTickers = function() {
        let title = document.getElementById('title').offsetWidth
        let author = document.getElementById('author').offsetWidth
        let right = document.getElementById('right').offsetWidth

        // remove old tickers
        if (title_ticker.running === true) {
            clearTimeout(title_ticker.ticker_object)
            title_ticker.running = false
            document.getElementById('title').style.transition = 'margin-left 0s linear'
            document.getElementById('title').style.marginLeft = '0'
        }

        // remove old tickers
        if (author_ticker.running === true) {
            clearTimeout(author_ticker.ticker_object)
            author_ticker.running = false
            document.getElementById('author').style.transition = 'margin-left 0s linear'
            document.getElementById('author').style.marginLeft = '0'
        }

        // add new tickers
        if (title > right) {
            title_ticker.distance = (title - right) * -1
            title_ticker.running = true
            title_ticker.ticker_object = setTimeout(titleTicker, 2000)
        }

        // add new tickers
        if (author > right) {
            author_ticker.distance = (author - right) * -1
            author_ticker.running = true
            author_ticker.ticker_object = setTimeout(authorTicker, 2000)
        }
    }

    let titleTicker = function() {
        if (title_ticker.state === 0) {
            title_ticker.state = 1
            let speed = title_ticker.distance / ticker_speed * -1
            document.getElementById('title').style.transition = 'margin-left ' + speed + 's linear'
            document.getElementById('title').style.marginLeft = title_ticker.distance + 'px'
            title_ticker.ticker_object = setTimeout(titleTicker, speed * 1000 + 2000)
            return
        }
        title_ticker.state = 0
        let speed = title_ticker.distance / ticker_speed * -0.1
        document.getElementById('title').style.transition = 'margin-left ' + speed + 's linear'
        document.getElementById('title').style.marginLeft = '0px'
        title_ticker.ticker_object = setTimeout(titleTicker, speed * 1000 + 2000)
        return
    }

    let authorTicker = function() {
        if (author_ticker.state === 0) {
            author_ticker.state = 1
            let speed = author_ticker.distance / ticker_speed * -1
            document.getElementById('author').style.transition = 'margin-left ' + speed + 's linear'
            document.getElementById('author').style.marginLeft = author_ticker.distance + 'px'
            author_ticker.ticker_object = setTimeout(authorTicker, speed * 1000 + 2000)
            return
        }
        author_ticker.state = 0
        let speed = author_ticker.distance / ticker_speed * -0.1
        document.getElementById('author').style.transition = 'margin-left ' + speed + 's linear'
        document.getElementById('author').style.marginLeft = '0px'
        author_ticker.ticker_object = setTimeout(authorTicker, speed * 1000 + 2000)
        return
    }

    let refreshToken = function() {
        if(loading_key.state === true){
            let current_stamp = new Date()
            current_stamp.setSeconds(current_stamp.getSeconds() - 10)
            if (current_stamp < loading_key.timestamp){
                return
            }
        }
        loading_key.state = true
        loading_key.timestamp = new Date()
        let xml = new XMLHttpRequest()
        xml.onreadystatechange = () => {
            if (xml.readyState == 4) {
                loading_key.state = false
                if (xml.response != '') {
                    xml = JSON.parse(xml.response)
                    if (xml.error_description === 'Invalid refresh token') {
                        window.location = 'https://yazaar.pythonanywhere.com/spotifyAPI/request/' + encodeURIComponent(encodeURIComponent(window.location.origin + window.location.pathname)) + '/user-read-currently-playing'
                    }
                    if (typeof xml.access_token == 'string') {
                        data.access_token = xml.access_token
                    }
                }
            }
        }
        xml.open('post', 'https://yazaar.pythonanywhere.com/spotifyAPI/refresh', true)
        xml.send(data.refresh_token)
    }

    let generateRGB = function() {
        // generate a RGB color with specific ruleset.
        let MyColor = [0, 0, 0]
        MyColor[Math.floor(Math.random() * 3)] = 255

        let SecondIndex = Math.floor(Math.random() * 4)

        if (MyColor[SecondIndex] == 0) {
            MyColor[SecondIndex] = Math.floor(Math.random() * 256)
        } else {
            MyColor[(SecondIndex + 1) % 2] = Math.floor(Math.random() * 256)
        }
        return 'rgb(' + MyColor[0] + ',' + MyColor[1] + ',' + MyColor[2] + ')'
    }

    let launch = function() {
        title_ticker = {
            'running': false,
            'distance': 0,
            'state': 0,
            'ticker_object': ''
        } // data for the title ticker
        author_ticker = {
            'running': false,
            'distance': 0,
            'state': 0,
            'ticker_object': ''
        } // data for the author ticker
    
        ticker_speed = 40 // changes the speed of the tickers, title and author
    
        let url_params = new URLSearchParams(window.location.search)
    
        if (typeof url_params.get('access_token') != 'string' && typeof url_params.get('refresh_token') != 'string' && window.location.hash == '') {
            window.location = 'https://yazaar.pythonanywhere.com/spotifyAPI/request/' + encodeURIComponent(encodeURIComponent(window.location.origin + window.location.pathname)) + '/user-read-currently-playing' + window.location.search
            return
        }
    
        if (window.location.search != '') {
            window.location = window.location.origin + window.location.pathname + '#' + window.location.search
            return
        }
    
        url_params = new URLSearchParams(window.location.hash.substr(1))
    
        data = {
            'access_token': url_params.get('access_token'),
            'refresh_token': url_params.get('refresh_token')
        }
    
        window.location.hash = ''
    
        window.addEventListener("resize", checkTickers)
    
        loop_variable = setInterval(newRequest, 2500)
        loading_key = {state: false, timestamp:new Date()}
    }
    let loading_key
    let loop_variable
    let ticker_speed
    launch()
}