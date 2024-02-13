// Selecting elements from the DOM
const playlistSongs = document.getElementById("playlist-songs");
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const nextButton = document.getElementById("next");
const previousButton = document.getElementById("previous");
const shuffleButton = document.getElementById("shuffle");

// Array of all songs
const allSongs = [{
      id: 0,
      title: "Scratching The Surface",
      artist: "Quincy Larson",
      duration: "4:25",
      src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/scratching-the-surface.mp3",
    },
    {
      id: 1,
      title: "Can't Stay Down",
      artist: "Quincy Larson",
      duration: "4:15",
      src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/cant-stay-down.mp3",
    },
    {
      id: 2,
      title: "Still Learning",
      artist: "Quincy Larson",
      duration: "3:51",
      src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/still-learning.mp3",
    },
    {
      id: 3,
      title: "Cruising for a Musing",
      artist: "Quincy Larson",
      duration: "3:34",
      src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/cruising-for-a-musing.mp3",
    },
    {
      id: 4,
      title: "Never Not Favored",
      artist: "Quincy Larson",
      duration: "3:35",
      src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/never-not-favored.mp3",
    },
    {
      id: 5,
      title: "From the Ground Up",
      artist: "Quincy Larson",
      duration: "3:12",
      src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/from-the-ground-up.mp3",
    },
    {
      id: 6,
      title: "Walking on Air",
      artist: "Quincy Larson",
      duration: "3:25",
      src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/walking-on-air.mp3",
    },
    {
      id: 7,
      title: "Can't Stop Me. Can't Even Slow Me Down.",
      artist: "Quincy Larson",
      duration: "3:52",
      src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/cant-stop-me-cant-even-slow-me-down.mp3",
    },
    {
      id: 8,
      title: "The Surest Way Out is Through",
      artist: "Quincy Larson",
      duration: "3:10",
      src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/the-surest-way-out-is-through.mp3",
    },
    {
      id: 9,
      title: "Chasing That Feeling",
      artist: "Quincy Larson",
      duration: "2:43",
      src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/chasing-that-feeling.mp3",
    }, 
];

// Creating an Audio object
const audio = new Audio();

// User data object containing the playlist, current song, and song current time
let userData = {
  songs: [...allSongs],
  currentSong: null,
  songCurrentTime: 0,
};

// Function to play a specific song
const playSong = (id) => {
  // Find the selected song
  const song = userData?.songs.find((song) => song.id === id);

  // Set audio source and title
  audio.src = song.src;
  audio.title = song.title;

  // Set current time based on whether it's a new song or a pause/resume
  if (userData?.currentSong === null || userData?.currentSong.id !== song.id) {
    audio.currentTime = 0;
  } else {
    audio.currentTime = userData?.songCurrentTime;
  }

  // Update current song in user data
  userData.currentSong = song;

  // Update UI and play the song
  playButton.classList.add("playing");
  highlightCurrentSong();
  setPlayerDisplay();
  setPlayButtonAccessibleText();
  audio.play();
};

// Function to pause the currently playing song
const pauseSong = () => {
  // Save the current time for resuming
  userData.songCurrentTime = audio.currentTime;
  
  // Update UI and pause the song
  playButton.classList.remove("playing");
  audio.pause();
};

// Function to play the next song in the playlist
const playNextSong = () => {
  if (userData?.currentSong === null) {
    // If no current song, play the first song
    playSong(userData?.songs[0].id);
  } else {
    // Find the index of the current song and play the next one
    const currentSongIndex = getCurrentSongIndex();
    const nextSong = userData?.songs[currentSongIndex + 1];
    playSong(nextSong.id);
  }
};

// Function to play the previous song in the playlist
const playPreviousSong = () => {
  if (userData?.currentSong === null) return;
  else {
    // Find the index of the current song and play the previous one
    const currentSongIndex = getCurrentSongIndex();
    const previousSong = userData?.songs[currentSongIndex - 1];
    playSong(previousSong.id);
  }
};

// Function to shuffle the playlist
const shuffle = () => {
  // Shuffle the songs in user data
  userData?.songs.sort(() => Math.random() - 0.5);

  // Reset current song and time
  userData.currentSong = null;
  userData.songCurrentTime = 0;

  // Render the shuffled songs
  renderSongs(userData?.songs);
  pauseSong();
  setPlayerDisplay();
  setPlayButtonAccessibleText();
};

// Function to delete a song from the playlist
const deleteSong = (id) => {
  // Check if the deleted song is the currently playing one
  if (userData?.currentSong?.id === id) {
    userData.currentSong = null;
    userData.songCurrentTime = 0;

    // Pause the song and update UI
    pauseSong();
    setPlayerDisplay();
  }

  // Remove the song from the playlist
  userData.songs = userData?.songs.filter((song) => song.id !== id);

  // Render the updated playlist
  renderSongs(userData?.songs); 
  highlightCurrentSong(); 
  setPlayButtonAccessibleText(); 

  // If the playlist is empty, show a reset button
  if (userData?.songs.length === 0) {
    const resetButton = document.createElement("button");
    const resetText = document.createTextNode("Reset Playlist");

    resetButton.id = "reset";
    resetButton.ariaLabel = "Reset playlist";
    resetButton.appendChild(resetText);
    playlistSongs.appendChild(resetButton);

    resetButton.addEventListener("click", () => {
      // Reset the playlist to the original set of songs
      userData.songs = [...allSongs];

      // Render the reset playlist
      renderSongs(userData?.songs); 
      setPlayButtonAccessibleText();
      resetButton.remove();
    });
  }
};

// Function to update the player display with the current song information
const setPlayerDisplay = () => {
  const playingSong = document.getElementById("player-song-title");
  const songArtist = document.getElementById("player-song-artist");
  const currentTitle = userData?.currentSong?.title;
  const currentArtist = userData?.currentSong?.artist;

  // Update the displayed song title and artist
  playingSong.textContent = currentTitle ? currentTitle : "";
  songArtist.textContent = currentArtist ? currentArtist : "";
};

// Function to highlight the currently playing song in the playlist
const highlightCurrentSong = () => {
  const playlistSongElements = document.querySelectorAll(".playlist-song");
  const songToHighlight = document.getElementById(
    `song-${userData?.currentSong?.id}`
  );

  // Remove aria-current attribute from all songs
  playlistSongElements.forEach((songEl) => {
    songEl.removeAttribute("aria-current");
  });

  // Set aria-current for the currently playing song
  if (songToHighlight) songToHighlight.setAttribute("aria-current", "true");
};

// Function to render the playlist songs in the DOM
const renderSongs = (array) => {
  const songsHTML = array
    .map((song)=> {
      return `
      <li id="song-${song.id}" class="playlist-song">
      <button class="playlist-song-info" onclick="playSong(${song.id})">
          <span class="playlist-song-title">${song.title}</span>
          <span class="playlist-song-artist">${song.artist}</span>
          <span class="playlist-song-duration">${song.duration}</span>
      </button>
      <button onclick="deleteSong(${song.id})" class="playlist-song-delete" aria-label="Delete ${song.title}">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#4d4d62"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.32587 5.18571C5.7107 4.90301 6.28333 4.94814 6.60485 5.28651L8 6.75478L9.39515 5.28651C9.71667 4.94814 10.2893 4.90301 10.6741 5.18571C11.059 5.4684 11.1103 5.97188 10.7888 6.31026L9.1832 7.99999L10.7888 9.68974C11.1103 10.0281 11.059 10.5316 10.6741 10.8143C10.2893 11.097 9.71667 11.0519 9.39515 10.7135L8 9.24521L6.60485 10.7135C6.28333 11.0519 5.7107 11.097 5.32587 10.8143C4.94102 10.5316 4.88969 10.0281 5.21121 9.68974L6.8168 7.99999L5.21122 6.31026C4.8897 5.97188 4.94102 5.4684 5.32587 5.18571Z" fill="white"/></svg>
        </button>
      </li>
      `;
    })
    .join("");

  // Set inner HTML of the playlist with the generated songs
  playlistSongs.innerHTML = songsHTML;
};

// Function to set accessible text for the play button
const setPlayButtonAccessibleText = () => {
  const song = userData?.currentSong || userData?.songs[0];

  // Set aria-label for the play button
  playButton.setAttribute(
    "aria-label",
    song?.title ? `Play ${song.title}` : "Play"
  );
};

// Function to get the index of the current song in the playlist
const getCurrentSongIndex = () => userData?.songs.indexOf(userData?.currentSong);

// Event listeners for player controls
playButton.addEventListener("click", () => {
  // Play the first song if no current song, otherwise resume current song
  if (userData?.currentSong === null) {
    playSong(userData?.songs[0].id);
  } else {
    playSong(userData?.currentSong.id);
  }
});

pauseButton.addEventListener("click",  pauseSong);
nextButton.addEventListener("click", playNextSong);
previousButton.addEventListener("click", playPreviousSong);
shuffleButton.addEventListener("click", shuffle);

// Event listener for the end of a song to automatically play the next song
audio.addEventListener("ended", () => {
  const currentSongIndex = getCurrentSongIndex();
  const nextSongExists = userData?.songs[currentSongIndex + 1] !== undefined;

  // Play the next song if available, otherwise reset the player
  if (nextSongExists) {
    playNextSong();
  } else {
    userData.currentSong = null;
    userData.songCurrentTime = 0; 
    pauseSong()
    setPlayerDisplay()
    highlightCurrentSong()
    setPlayButtonAccessibleText()
  }
});

// Sort the songs alphabetically by title
userData?.songs.sort((a,b) => {
  if (a.title < b.title) {
    return -1;
  }

  if (a.title > b.title) {
    return 1;
  }

  return 0;
});

// Initial rendering of the playlist
renderSongs(userData?.songs);
setPlayButtonAccessibleText();
