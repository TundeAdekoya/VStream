let client = AgoraRTC.createClient({mode:'rtc', 'codec':'vp8'}) 

let config = {
    appid:'142ed52c156c45438c7424e9d4fea0e6',
    token:'006142ed52c156c45438c7424e9d4fea0e6IAAHGaOyqHoxYofGoALuWv4zFgseeUwXTSONVXW05b042dAl/1MAAAAAEAAcu75GX9BPYgEAAQBf0E9i',
    uid:null,
    channel:'vstream',
}

let localTracks = {
    audioTrack:null,
    videoTrack:null,
}

let localTrackState = {
    audioTrackMuted: false,
    videoTrackMuted: false,
}

//to join stream
let remoteTracks = {}

document.querySelector('#join-btn').addEventListener('click', async () =>  {
    console.log('User Joined stream')
    await joinStreams()
    document.querySelector('#join-btn').style.display = 'none'
    document.querySelector('#footer').style.display = 'flex'
})

//to mute mic
document.querySelector('#mic-btn').addEventListener('click', async () => {
    if (!localTrackState.audioTrackMuted) {
        await localTracks.audioTrack.setMuted(true)
        localTrackState.audioTrackMuted = true
        document.querySelector('#mic-btn').style.backgroundColor = 'rgb(255, 80, 80, 0.7)'
    } else {
        await localTracks.audioTrack.setMuted(false)
        localTrackState.audioTrackMuted = false
        document.querySelector('#mic-btn').style.backgroundColor = '#3468c2'
    } 
})

//to mute camera
document.querySelector('#camera-btn').addEventListener('click', async () => {
    if (!localTrackState.videoTrackMuted) {
        await localTracks.videoTrack.setMuted(true)
        localTrackState.videoTrackMuted = true
        document.querySelector('#camera-btn').style.backgroundColor = 'rgb(255, 80, 80, 0.7)'
    } else {
        await localTracks.videoTrack.setMuted(false)
        localTrackState.videoTrackMuted = false
        document.querySelector('#camera-btn').style.backgroundColor = '#3467c2'
    } 
})

//to remove user 
document.querySelector('#leave-btn').addEventListener('click', async () => {
    for(trackName in localTracks) {
        let track = localTracks[trackName]
        if(track){
            //stops camera and mic 
            track.stop()
            //disconnects from camera and mic 
            track.close()
            localTracks[trackName] = null
        }
    }
    await client.leave()
    document.querySelector('#user-streams').innerHTML = ''
    document.querySelector('#footer').style.display = 'none'
    document.querySelector('#join-btn').style.display = 'block'
})

//to display stream 
let joinStreams = async () => {

    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserLeft);

    //stream setting
    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
        client.join(config.appid, config.channel, config.token || null, config.uid || null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
    ])

    //display video and add to playlist
    let player = `<div class='video-containers' id='video-wrapper-${config.uid}'>
                                <p class='user-uid'>User ID: ${config.uid}</p>
                                <div class='video-player player' id='stream-${config.uid}'></div>
                        </div>`

    document.querySelector('#user-streams').insertAdjacentHTML("beforeend", player)
 
    //play video 
    localTracks.videoTrack.play(`stream-${config.uid}`)

    //publish video
    await client.publish([localTracks.audioTrack, localTracks.videoTrack])
}

//user left
let handleUserLeft = async (user) => {
    delete remoteTracks[user.uid];
    document.querySelector(`#video-wrapper-${user.uid}`)
} 

//user joined 
let handleUserJoined = async (user, mediaType) => {
    console.log('User has joined our stream');
    remoteTracks[user.uid] = user

    await client.subscribe (user, mediaType)

   let videoPlayer = document.querySelector(`#video-wrapper-${user.uid}`)
    if(videoPlayer != null) {
        videoPlayer.remove()
    }
 
    if (mediaType === 'video') {
        let videoPlayer = `<div class='video-containers' id='video-wrapper-${user.uid}'>
                                <p class='user-uid'>User ID: ${user.uid}</p>
                                <div class='video-player player' id='stream-${user.uid}'></div>
                            </div>`
    
        document.querySelector('#user-streams').insertAdjacentHTML("beforeend", videoPlayer)
    
        user.videoTrack.play(`stream-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
}













