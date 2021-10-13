window.addEventListener('load', onstart)
document.addEventListener('click', e => {
  var menu = document.querySelector(".menu ul")
  if (!(e.target.matches('.menu ul li') || e.target.matches('.menu ul li a'))) {
    if (e.target.matches('.dots') || e.target.matches('.dots span')) {
      menu.classList.toggle('open')
    } else if (menu.className == "open") {
      menu.className = ""
    } else {
      menu.className = ""
    }
  } else {
    menu.className = ""
  }
})

function onstart() {
  var profileMenu = document.querySelector("#profile")
  var apiMenu = document.querySelector("#api-direct")
  var youtubeMenu = document.querySelector("#youtube")

  profileMenu.addEventListener('click',
    profile)
  apiMenu.addEventListener('click',
    redirect)
  youtubeMenu.addEventListener('click',
    youtube)
    
    document.querySelector('.menu ul').style.transition = "all 0.2s"
    document.querySelector('.download-container').style.transition = "opacity 0.2s"

  var input = document.querySelector('#url-input')
  var clearBtn = document.querySelector('.form-label-group > span')

  var prosesBtn = document.querySelector('.action')

  input.addEventListener('input',
    e => {
      input.value == "" ? clearBtn.style.display = "none": clearBtn.style.display = "block"
    })

  clearBtn.addEventListener('click',
    () => {
      input.value = ""
      clearBtn.style.display = "none"
    })

  prosesBtn.addEventListener('click',
    () => {
      input.value == '' || !input.value.includes('youtu') ? alert('please input a valid youtube video link'): prosessing(getVideoId(input.value))
    })
}

function profile() {
  document.querySelector("#profile > a").click()
}

function redirect() {
  document.querySelector('#api-direct > a').click()
}

function youtube() {
  document.querySelector('#youtube > a').click()
}

function getVideoId(videoUrl) {
  var splitUrl = videoUrl.split('/')
  var idPos = splitUrl[3]
  if (idPos.includes('watch?v=')) return idPos.replace('watch?v=', '').split('&')[0]
  return idPos.split('\\?')[0]
}

function prosessing(videoId) {
  console.clear()
  console.log('%cvideo id: ' + videoId,
    `
    color:#b3ffffff;
    font-weight:bold;
    `)

  var videoEmbed = "https://www.youtube.com/embed/" + videoId
  var mp4Rq = false
  var mp3Rq = false

  var mp4 = []
  var mp3 = []

  var loader = document.querySelector('.loader')
  var downloadContainer = document.querySelector('.download-container')
  var prosesBtn = document.querySelector('.action')
  var inputBox = document.querySelector('#url-input')
  var tabsItem = document.querySelectorAll('.tabs span')
  
  var thumbnail = document.querySelector('.download-thumbnail')
  var title = document.querySelector('.download-title')
  var player = document.querySelector('.download-player')
  var downloadMeta = document.querySelector('.download-view')

  prosesBtn.style.pointerEvents = 'none'

  downloadContainer.classList.remove('show')
  loader.style.display = 'block'

  tabsItem.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tab.parentElement.querySelector('.selected').className = ""
      tab.className = "selected"
      var videoShow = document.querySelector('.download-video')
      var audioShow = document.querySelector('.download-audio')
      if (tab == tabsItem[0]) {
        videoShow.style.display = "block"
        audioShow.style.display = "none"
      } else {
        videoShow.style.display = "none"
        audioShow.style.display = "block"
      }
    })
  })

  var errorOccured = (state) => {
    console.log('error')
    alert('error occured with ready state: ' + state)
    loader.style.display = "none"
    downloadContainer.classList.remove('show')
    prosesBtn.style.pointerEvents = 'auto'
  }

  var createView = (videoRqDone, audioRqDone, titleText) => {
    if (!(videoRqDone && audioRqDone)) {
      return
    }

    title.innerText = titleText
    player.src = videoEmbed
    loader.style.display = "none"
    downloadContainer.classList.add('show')
    prosesBtn.style.pointerEvents = 'auto'

    var videoAdapter = document.querySelector('.download-video')
    videoAdapter.style.display = "block"
    var audioAdapter = document.querySelector('.download-audio')
    
    videoAdapter.innerHTML = ""
    audioAdapter.innerHTML = ""

    mp4.forEach(item => {
      var div = document.createElement('div')
      div.className = "row"
      var quality = document.createElement('span')
      quality.className = "quality"
      quality.innerText = item.quality
      div.append(quality)
      var size = document.createElement('span')
      size.className = "size"
      size.innerText = item.size
      div.append(size)
      var downloadBtn = document.createElement('a')
      downloadBtn.className = "download-btn"
      downloadBtn.href = item.url
      downloadBtn.innerText = "DOWNLOAD"
      div.append(downloadBtn)
      videoAdapter.append(div)
    })
    mp3.forEach(item => {
      var div = document.createElement('div')
      div.className = "row"
      var quality = document.createElement('span')
      quality.className = "quality"
      quality.innerText = item.quality
      div.append(quality)
      var size = document.createElement('span')
      size.className = "size"
      size.innerText = item.size
      div.append(size)
      var downloadBtn = document.createElement('a')
      downloadBtn.className = "download-btn"
      downloadBtn.href = item.url
      downloadBtn.innerText = "DOWNLOAD"
      div.append(downloadBtn)
      audioAdapter.append(div)
    })
    console.log("done")
  }

  console.log('getting data from server...')

  var videoRequest = new XMLHttpRequest();
  videoRequest.open('GET', 'https://www.yt-download.org/api/widget/videos/' + videoId);
  videoRequest.responseType = "document"
  videoRequest.onprogress = () => {
    if (navigator.onLine) {} else {
      errorOccured(videoRequest.readyState)
    }
  }
  videoRequest.onload = function () {
    if (videoRequest.readyState == videoRequest.DONE && videoRequest.status == 200) {
      mp4Rq = true
      var respon = videoRequest.responseXML
      thumbnail.href = respon.querySelector('img').src
      console.log(respon.querySelector('img').src)

      try {
        var div = respon.querySelector(".download");
        var links = div.querySelectorAll("a");
        if (typeof links !== 'undefined' && links.length <= 0) {
          var error = div.querySelector("h3");
          console.log("Something went wrong");
          for (var desc of error) {

            console.log(desc.innerText);
          }
        } else {
          links.forEach(e => {
            mp4.push({
              url: e.href,
              format: e.innerText.split(" ")[32].replace("\n", ""),
              quality: e.innerText.split(" ")[184].replace("\n", ""),
              size: e.innerText.split(" ")[396].replace("\n", "") + " " + e.innerText.split(" ")[397].replace("\n", "")
            })
          })
        }
      } catch (e) {
        
      }
      createView(mp4Rq, mp3Rq, respon.querySelector('h2').innerText.trim())
    } else {
      alert('Something error with the API, please try again')
    }
  };
  videoRequest.timeout = 10000
  videoRequest.ontimeout = () => {
    errorOccured(videoRequest.readyState)
  }
  videoRequest.send();

  var audioRequest = new XMLHttpRequest();
  audioRequest.open('GET', 'https://www.yt-download.org/api/widget/mp3/' + videoId);
  audioRequest.responseType = "document"
  audioRequest.onprogress = () => {
    if (navigator.onLine) {} else {
      errorOccured(audioRequest.readyState)
    }
  }
  audioRequest.onload = function () {
    if (audioRequest.readyState == audioRequest.DONE && audioRequest.status == 200) {
      mp3Rq = true
      var respon = audioRequest.responseXML

      try {
        var div = respon.querySelector(".download");
        var links = div.querySelectorAll("a");
        if (typeof links !== 'undefined' && links.length <= 0) {
          var error = div.querySelector("h3");
          console.log("Something went wrong");
          for (var desc of error) {

            console.log(desc.innerText);
          }
        } else {
          links.forEach(e => {
            mp3.push({
              url: e.href,
              format: e.innerText.split(" ")[32].replace("\n", ""),
              quality: e.innerText.split(" ")[100] + " " + e.innerText.split(" ")[101].replace("\n", ""),
              size: e.innerText.split(" ")[237] + " " + e.innerText.split(" ")[238].replace("\n", "")
            })
          })
        }
      } catch (e) {
        
      }

      createView(mp4Rq, mp3Rq, respon.querySelector('h2').innerText.trim())
    } else {
      alert('Something error with the API, please try again')
    }
  };
  audioRequest.timeout = 10000
  audioRequest.ontimeout = () => {
    errorOccured(audioRequest.readyState)
  }
  audioRequest.send();
}
function about(){
  Swal.fire({
  title: 'About Me',
  text: 'Hello Everyone I am Anargya. I like music, web development and tea :)',
  showDenyButton: true,
  confirmButtonText: 'Github',
  denyButtonText: `Youtube`,
}).then((result) => {
  if (result.isConfirmed) {
    Swal.fire('anargya-anubhawa','https://github.com/anargya-anubhawa','info')
  } else if (result.isDenied) {
    Swal.fire('Anargya Anubhawa', '<a>bit.ly/anargyayoutube</a>','info')
  }
})
}