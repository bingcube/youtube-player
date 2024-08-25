// ==UserScript==
// @name         DUOS Music Player
// @namespace    http://tampermonkey.net/
// @version      BETA 0.0.6
// @description  DUOS Music Player with macOS style
// @author       Sky @blurskydev
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const styles = `
    #macos-music-system {
        width: 400px;
        height: 400px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(20px);
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.3s ease;
        display: none;
    }
    #macos-title-bar {
        height: 30px;
        background: #ececec;
        display: flex;
        align-items: center;
        padding: 0 10px;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
    }
    .macos-button {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .macos-button.red {
        background: #ff5f57;
    }
    .macos-button.red:hover {
        background: #ff1c1c;
    }
    .macos-button.red:active {
        background: #e00b0b;
        transform: scale(0.9);
    }
    .macos-button.yellow {
        background: #ffbd2e;
    }
    .macos-button.yellow:hover {
        background: #ffaa00;
    }
    .macos-button.yellow:active {
        background: #e09700;
        transform: scale(0.9);
    }
    .macos-button.green {
        background: #28c940;
    }
    .macos-button.green:hover {
        background: #20b335;
    }
    .macos-button.green:active {
        background: #1a9b2c;
        transform: scale(0.9);
    }
    #macos-music-content {
        flex: 1;
        padding: 20px;
        color: #333;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 14px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    #macos-music-content button {
        border-radius: 12px; /* Bo tròn góc tất cả các nút */
    }
    #macos-music-content input[type="text"] {
        border-radius: 12px;
    }
    #macos-fail-dialog {
        width: 350px;
        height: 220px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(20px);
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 20px;
    }
    #fail-dialog-icon {
        width: 50px;
        height: 50px;
        margin-bottom: 20px;
    }
    #fail-dialog-text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 14px;
        color: #333;
        margin-bottom: 10px;
    }
    #fail-dialog-details {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 12px;
        color: #f00;
        margin-bottom: 20px;
    }
    .fail-dialog-button {
        padding: 8px 16px;
        background-color: #007aff;
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 14px;
        margin: 0 5px;
        transition: background-color 0.3s;
    }
    .fail-dialog-button.cancel {
        background-color: #e0e0e0;
        color: #333;
    }
    .fail-dialog-button.cancel:hover {
        background-color: #cccccc;
    }
    .fail-dialog-button.cancel:active {
        background-color: #b8b8b8;
    }
    .fail-dialog-button:hover {
        background-color: #005fcc;
    }
    .fail-dialog-button:active {
        background-color: #004bb5;
    }
    #download-btn {
        background-color: #FF4500;
        color: white;
        border: none;
        border-radius: 12px;
        padding: 8px 12px;
        margin-left: 10px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    #download-btn img {
        width: 16px;
        height: 16px;
    }
    #download-btn:hover {
        background-color: #e03e00;
    }
    #download-btn:active {
        background-color: #c03500;
    }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const musicSystem = document.createElement('div');
    musicSystem.id = 'macos-music-system';
    musicSystem.innerHTML = `
    <div id="macos-title-bar">
        <div class="macos-button red" id="close-btn"></div>
        <div class="macos-button yellow" id="minimize-btn"></div>
        <div class="macos-button green" id="maximize-btn"></div>
    </div>
    <div id="macos-music-content">
        <p>Enter YouTube link to play music:</p>
        <input type="text" id="youtube-link-input" placeholder="Enter YouTube link..." style="width: 100%; padding: 8px; margin-top: 10px; border-radius: 12px; border: 1px solid #ccc; font-size: 14px;">
        <div style="display: flex; align-items: center; margin-top: 20px;">
            <button id="play-music-btn" style="padding: 8px 16px; background-color: #28c940; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 14px;">Play Music</button>
            <button id="download-btn"><img src="https://raw.githubusercontent.com/blurskydev/DUOS/main/gui-asset/download%20icon.png" alt="Download"></button>
        </div>
        <input type="range" id="volume-control" min="0" max="100" value="50" style="margin-top: 20px; width: 100%; border-radius: 12px;">
        <div id="video-container" style="margin-top: 20px; width: 100%; height: 100%;">
            <iframe id="music-player" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
        </div>
    </div>
    `;

    document.body.appendChild(musicSystem);

    const failDialog = document.createElement('div');
    failDialog.id = 'macos-fail-dialog';
    failDialog.innerHTML = `
    <img id="fail-dialog-icon" src="https://raw.githubusercontent.com/baolong7651/macos-style-opsc/main/macos-icon-asset/errorfile-icon.png" alt="Icon">
    <div id="fail-dialog-text">Failed to load the music. Please check the link and try again.</div>
    <div id="fail-dialog-details"></div>
    <div>
        <button class="fail-dialog-button cancel" id="fail-dialog-cancel-button">Cancel</button>
        <button class="fail-dialog-button" id="fail-dialog-retry-button">Retry</button>
    </div>
    `;
    document.body.appendChild(failDialog);

    let isMaximized = false;
    const closeBtn = document.getElementById('close-btn');
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const videoContainer = document.getElementById('video-container');
    const playMusicBtn = document.getElementById('play-music-btn');
    const downloadBtn = document.getElementById('download-btn');
    const musicPlayer = document.getElementById('music-player');
    const volumeControl = document.getElementById('volume-control');
    const youtubeLinkInput = document.getElementById('youtube-link-input');
    const failDialogDetails = document.getElementById('fail-dialog-details');

    closeBtn.addEventListener('click', function() {
        musicSystem.style.display = 'none';
    });

    minimizeBtn.addEventListener('click', function() {
        if (isMaximized) {
            musicSystem.style.width = '400px';
            musicSystem.style.height = '400px';
            musicSystem.style.top = '50%';
            musicSystem.style.left = '50%';
            musicSystem.style.transform = 'translate(-50%, -50%)';
            isMaximized = false;
        }
        musicSystem.style.height = '30px';
    });

    maximizeBtn.addEventListener('click', function() {
        if (isMaximized) {
            musicSystem.style.width = '400px';
            musicSystem.style.height = '400px';
            musicSystem.style.top = '50%';
            musicSystem.style.left = '50%';
            musicSystem.style.transform = 'translate(-50%, -50%)';
        } else {
            musicSystem.style.width = '100vw';
            musicSystem.style.height = '100vh';
            musicSystem.style.top = '0';
            musicSystem.style.left = '0';
            musicSystem.style.transform = 'none';
        }
        isMaximized = !isMaximized;
    });

    let isDragging = false;
    let startX, startY;

    musicSystem.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX - musicSystem.offsetLeft;
        startY = e.clientY - musicSystem.offsetTop;
        document.addEventListener('mousemove', onMouseMove);
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
    });

    function onMouseMove(e) {
        if (isDragging) {
            musicSystem.style.left = `${e.clientX - startX}px`;
            musicSystem.style.top = `${e.clientY - startY}px`;
        }
    }

    playMusicBtn.addEventListener('click', function() {
        const youtubeLink = youtubeLinkInput.value;
        const videoId = extractVideoId(youtubeLink);
        if (videoId) {
            const musicUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            musicPlayer.src = musicUrl;
            musicPlayer.style.display = 'block';
        } else {
            showFailDialog('Invalid YouTube link.');
        }
    });

    downloadBtn.addEventListener('click', function() {
        const youtubeLink = youtubeLinkInput.value;
        const videoId = extractVideoId(youtubeLink);
        if (videoId) {
            const downloadUrl = `https://www.youtube.com/watch?v=${videoId}`;
            window.open(downloadUrl, '_blank');
        } else {
            showFailDialog('Invalid YouTube link.');
        }
    });

    volumeControl.addEventListener('input', function() {
        musicPlayer.volume = volumeControl.value / 100;
    });

    function extractVideoId(url) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const matches = url.match(regex);
        return matches ? matches[1] : null;
    }

    function showFailDialog(errorMessage) {
        failDialogDetails.textContent = errorMessage;
        failDialog.style.display = 'flex';
    }

    document.getElementById('fail-dialog-cancel-button').addEventListener('click', function() {
        failDialog.style.display = 'none';
    });

    document.getElementById('fail-dialog-retry-button').addEventListener('click', function() {
        failDialog.style.display = 'none';
        playMusicBtn.click();
    });

    musicSystem.style.display = 'block';

})();
