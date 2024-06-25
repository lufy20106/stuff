// Replace with your own YouTube Data API key
const API_KEY = 'AIzaSyCUj6JTL4SBlT_iizl-Jr-HqwCCQ6OlZZA';

let player;
let queue = [];
let currentIndex = 0;
let shuffle = false;
let loop = false;
let loopQueue = false;

// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Create a YouTube player variable.
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0', // Set height to 0 to hide the video
        width: '0',  // Set width to 0 to hide the video
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    // Player is ready to be controlled.
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNextVideo();
    }
    if (event.data === YT.PlayerState.PLAYING) {
        updateSliders();
    }
}

function playSound() {
    if (player && player.playVideo) {
        player.playVideo();
    }
}

function stopSound() {
    if (player && player.stopVideo) {
        player.stopVideo();
    }
}

function loadVideo(videoId) {
    player.loadVideoById(videoId);
    document.getElementById('playButton').style.display = 'block';
    document.getElementById('stopButton').style.display = 'block';
}

function addVideoOrPlaylist() {
    const videoLink = document.getElementById('videoLink').value;
    if (videoLink.includes('list=')) {
        const playlistId = getPlaylistIdFromUrl(videoLink);
        if (playlistId) {
            fetchPlaylistVideos(playlistId);
        } else {
            alert('Invalid playlist link');
        }
    } else {
        const videoId = getVideoIdFromUrl(videoLink);
        if (videoId) {
            fetchVideoDetails(videoId, (details) => {
                queue.push(details);
                updateQueueDisplay();
                if (queue.length === 1) {
                    loadVideo(videoId);
                }
            });
        } else {
            alert('Invalid YouTube link');
        }
    }
}

function getVideoIdFromUrl(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}

function getPlaylistIdFromUrl(url) {
    const regex = /[?&]list=([^#\&\?]+)/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}

function fetchVideoDetails(videoId, callback) {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.items.length > 0) {
                const snippet = data.items[0].snippet;
                const details = {
                    id: videoId,
                    title: snippet.title,
                    author: snippet.channelTitle,
                    thumbnail: snippet.thumbnails.default.url
                };
                callback(details);
            } else {
                console.error('No video found with the provided ID.');
            }
        })
        .catch(error => console.error('Error fetching video details:', error));
}

function fetchPlaylistVideos(playlistId) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${API_KEY}&part=snippet&maxResults=50`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const videos = data.items;
            videos.forEach(video => {
                const videoId = video.snippet.resourceId.videoId;
                const title = video.snippet.title;
                const author = video.snippet.channelTitle;
                const thumbnail = video.snippet.thumbnails.default.url;
                queue.push({ id: videoId, title: title, author: author, thumbnail: thumbnail });
            });
            updateQueueDisplay();
            if (queue.length > 0) {
                loadVideo(queue[0].id);
            }
        })
        .catch(error => console.error('Error fetching playlist videos:', error));
}

function updateSliders() {
    const timeSlider = document.getElementById('timeSlider');
    const volumeSlider = document.getElementById('volumeSlider');

    setInterval(() => {
        if (player && player.getCurrentTime) {
            timeSlider.value = player.getCurrentTime();
            timeSlider.max = player.getDuration();
        }
    }, 1000);

    if (player && player.setVolume) {
        player.setVolume(volumeSlider.value);
    }
}

function seekVideo() {
    const timeSlider = document.getElementById('timeSlider');
    if (player && player.seekTo) {
        player.seekTo(timeSlider.value, true);
    }
}

function changeVolume() {
    const volumeSlider = document.getElementById('volumeSlider');
    if (player && player.setVolume) {
        player.setVolume(volumeSlider.value);
    }
}

function updateQueueDisplay() {
    const queueDiv = document.getElementById('queue');
    queueDiv.innerHTML = '';
    queue.forEach((video, index) => {
        const div = document.createElement('div');
        div.innerHTML = `<img src="${video.thumbnail}" alt="Thumbnail"><strong>${video.title}</strong> by ${video.author}`;
        if (index === currentIndex) {
            div.style.fontWeight = 'bold';
        }
        queueDiv.appendChild(div);
    });
}

function playNextVideo() {
    if (loop) {
        player.seekTo(0);
        player.playVideo();
        return;
    }

    currentIndex++;
    if (currentIndex >= queue.length) {
        if (loopQueue) {
            currentIndex = 0;
        } else {
            currentIndex = queue.length - 1;
            return;
        }
    }

    if (shuffle) {
        currentIndex = Math.floor(Math.random() * queue.length);
    }

    loadVideo(queue[currentIndex].id);
    updateQueueDisplay();
}

function toggleShuffle() {
    shuffle = !shuffle;
    const shuffleButton = document.getElementById('shuffleButton');
    if (shuffle) {
        shuffleButton.classList.add('active');
    } else {
        shuffleButton.classList.remove('active');
    }
}

function toggleLoop() {
    loop = !loop;
    const loopButton = document.getElementById('loopButton');
    if (loop) {
        loopButton.classList.add('active');
    } else {
        loopButton.classList.remove('active');
    }
}

function toggleLoopQueue() {
    loopQueue = !loopQueue;
    const loopQueueButton = document.getElementById('loopQueueButton');
    if (loopQueue) {
        loopQueueButton.classList.add('active');
    } else {
        loopQueueButton.classList.remove('active');
    }
}