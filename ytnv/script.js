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
            fetchPlaylistItems(playlistId);
        } else {
            alert('Invalid YouTube playlist link');
        }
    } else {
        const videoId = getVideoIdFromUrl(videoLink);
        if (videoId) {
            addVideoToQueue(videoId);
        } else {
            alert('Invalid YouTube video link');
        }
    }
}

function getVideoIdFromUrl(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}

function getPlaylistIdFromUrl(url) {
    const regex = /[?&]list=([a-zA-Z0-9_-]+)/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}

function fetchVideoDetails(videoId, callback) {
    const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const details = {
                id: videoId,
                title: data.title,
                author: data.author_name,
                thumbnail: data.thumbnail_url
            };
            callback(details);
        })
        .catch(error => console.error('Error fetching video details:', error));
}

function fetchPlaylistItems(playlistId) {
    const apiKey = 'AIzaSyCUj6JTL4SBlT_iizl-Jr-HqwCCQ6OlZZA';
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            data.items.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;
                const details = {
                    id: videoId,
                    title: item.snippet.title,
                    author: item.snippet.videoOwnerChannelTitle,
                    thumbnail: item.snippet.thumbnails.default.url
                };
                queue.push(details);
                if (queue.length === 1) {
                    loadVideo(videoId);
                }
            });
            updateQueueDisplay();
        })
        .catch(error => console.error('Error fetching playlist items:', error));
}

function addVideoToQueue(videoId) {
    const details = {
        id: videoId,
        title: 'Loading...',  // Placeholder text until we get the real title
        author: '',
        thumbnail: ''
    };
    queue.push(details);
    updateQueueDisplay();
    fetchVideoDetails(videoId, (realDetails) => {
        details.title = realDetails.title;
        details.author = realDetails.author;
        details.thumbnail = realDetails.thumbnail;
        updateQueueDisplay();
        if (queue.length === 1) {
            loadVideo(videoId);
        }
    });
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
    updateCurrentPlaying();
}

function updateCurrentPlaying() {
    const currentPlayingDiv = document.getElementById('currentPlaying');
    if (queue.length > 0 && currentIndex < queue.length) {
        const currentVideo = queue[currentIndex];
        currentPlayingDiv.innerHTML = `Currently Playing: <strong>${currentVideo.title}</strong> by ${currentVideo.author}`;
    } else {
        currentPlayingDiv.innerHTML = 'Not playing';
    }
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

function showTooltip(event) {
    const tooltip = document.getElementById('tooltip');
    const timeSlider = event.target;
    const value = timeSlider.value;
    const duration = timeSlider.max;

    const minutesNow = Math.floor(value / 60);
    const secondsNow = Math.floor(value % 60).toString().padStart(2, '0');
    const minutesTotal = Math.floor(duration / 60);
    const secondsTotal = Math.floor(duration % 60).toString().padStart(2, '0');

    tooltip.innerText = `${minutesNow}:${secondsNow} / ${minutesTotal}:${secondsTotal}`;
    tooltip.style.left = `${event.clientX - tooltip.clientWidth / 2}px`;
    tooltip.style.top = `${timeSlider.getBoundingClientRect().top - tooltip.clientHeight - 10}px`;
    tooltip.style.display = 'block';
}

function updateTooltip() {
    const timeSlider = document.getElementById('timeSlider');
    const tooltip = document.getElementById('tooltip');
    const value = timeSlider.value;
    const duration = timeSlider.max;

    const minutesNow = Math.floor(value / 60);
    const secondsNow = Math.floor(value % 60).toString().padStart(2, '0');
    const minutesTotal = Math.floor(duration / 60);
    const secondsTotal = Math.floor(duration % 60).toString().padStart(2, '0');

    tooltip.innerText = `${minutesNow}:${secondsNow} / ${minutesTotal}:${secondsTotal}`;
    tooltip.style.left = `${timeSlider.getBoundingClientRect().left + (timeSlider.clientWidth * (value / duration)) - tooltip.clientWidth / 2}px`;
}

function updateSliders() {
    const timeSlider = document.getElementById('timeSlider');
    const volumeSlider = document.getElementById('volumeSlider');

    // Update time slider
    if (player && player.getCurrentTime && player.getDuration) {
        timeSlider.max = player.getDuration();
        timeSlider.value = player.getCurrentTime();
    }

    // Update volume slider
    if (player && player.getVolume) {
        volumeSlider.value = player.getVolume();
    }

    timeSlider.addEventListener('input', seekVideo);
    volumeSlider.addEventListener('input', changeVolume);

    setInterval(() => {
        if (player && player.getCurrentTime) {
            timeSlider.value = player.getCurrentTime();
            timeSlider.max = player.getDuration();
            updateTooltip();
        }
    }, 1000);
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