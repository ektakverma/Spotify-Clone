console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currentfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currentfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
    //Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Nancy</div>

                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div></li>`;
    }


    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentfolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    
    
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    Array.from(anchors).forEach(e=>{
        if(e.href.includes("/songs")){
            console.log(e.href.split("/").slice(-2)[0])
        }
    })
    
}


async function main() {

    //Get the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)
    
    
    // Display all the albums on the page
    
    displayAlbums()
    
    //Attach an event listener to play next and previous

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/ ${secondsToMinutesSeconds(currentSong.duration)}`
        // for movement of circle in playbar
        document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration)*100 + "%" ;
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click" , e=>{
        //  for if seekbar is moving time duration is also changing
        let percent= ( e.offsetX/e.target.getBoundingClientRect().width )* 100 ;
        document.querySelector(".circle").style.left = percent + "%" ;
        currentSong.currentTime = ((currentSong.duration)* percent)/100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click" , ()=>{
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for cross button
    document.querySelector(".cross").addEventListener("click" , ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener for previous and next button 
    previous.addEventListener("click" , ()=>{
        currentSong.pause()
        console.log("Previous Clicked")
        
        let index= songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        
        if((index - 1) >= 0){
            playMusic(songs[index-1])
        }
    })

    next.addEventListener("click" , ()=>{
        currentSong.pause()
        console.log("Next Clicked")

        let index= songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        
        if((index + 1) < songs.length ){
            playMusic(songs[index+1])
        }
        
    })

    // Add event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
       console.log("Setting volume to" , e.target.value ,"/100")
        currentSong.volume= parseInt(e.target.value)/100
    })

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        console.log(e)
        e.addEventListener("click" , async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
              
        })
    })

}

main()