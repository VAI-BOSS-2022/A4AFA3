const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');
const { getStreamFromURL, shortenURL, randomString } = global.utils;

const API_KEYS = [
    'b38444b5b7mshc6ce6bcd5c9e446p154fa1jsn7bbcfb025b3b',
    '719775e815msh65471c929a0203bp10fe44jsndcb70c04bc42',
    
    'a2743acb5amsh6ac9c5c61aada87p156ebcjsnd25f1ef87037',
    '8e938a48bdmshcf5ccdacbd62b60p1bffa7jsn23b2515c852d',
    'f9649271b8mshae610e65f24780cp1fff43jsn808620779631',
    '8e906ff706msh33ffb3d489a561ap108b70jsne55d8d497698',

    '4bd76967f9msh2ba46c8cf871b4ep1eab38jsn19c9067a90bb',
];

async function video(api, event, args, message) {
    const wtxt = await message.reply("🎥 Finding and Downloading...");
    try {
        let title = '';
        let shortUrl = '';
        let videoId = '';

        const extractShortUrl = async () => {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type === "video" || attachment.type === "audio") {
                return attachment.url;
            } else {
                throw new Error("Invalid attachment type.");
            }
        };

        const getRandomApiKey = () => {
            const randomIndex = Math.floor(Math.random() * API_KEYS.length);
            return API_KEYS[randomIndex];
        };

        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
            shortUrl = await extractShortUrl();
            const musicRecognitionResponse = await axios.get(`https://audio-recon-ahcw.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`);
            title = musicRecognitionResponse.data.title;
            const searchResponse = await axios.get(`https://youtube-kshitiz-gamma.vercel.app/yt?search=${encodeURIComponent(title)}`);
            if (searchResponse.data.length > 0) {
                videoId = searchResponse.data[0].videoId;
            }

            shortUrl = await shortenURL(shortUrl);
        } else if (args.length === 0) {
            message.reply("Please provide a video name or reply to a video or audio attachment.");
            return;
        } else {
            title = args.join(" ");
            const searchResponse = await axios.get(`https://youtube-kshitiz-gamma.vercel.app/yt?search=${encodeURIComponent(title)}`);
            if (searchResponse.data.length > 0) {
                videoId = searchResponse.data[0].videoId;
            }

            const videoUrlResponse = await axios.get(`https://yt-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}&apikey=${getRandomApiKey()}`);
            if (videoUrlResponse.data.length > 0) {
                shortUrl = await shortenURL(videoUrlResponse.data[0]);
            }
        }

        if (!videoId) {
            message.reply("No video found for the given query.");
            return;
        }

        const downloadResponse = await axios.get(`https://yt-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}&apikey=${getRandomApiKey()}`);
        const videoUrl = downloadResponse.data[0];

        if (!videoUrl) {
            message.reply("Failed to retrieve download link for the video.");
            return;
        }

        const writer = fs.createWriteStream(path.join(__dirname, "cache", `${videoId}.mp4`));
        const response = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
            const videoStream = fs.createReadStream(path.join(__dirname, "cache", `${videoId}.mp4`));
            api.unsendMessage(wtxt.messageID);
            message.reply({ body: `🎥 𝗣𝗹𝗮𝘆𝗶𝗻𝗴 : ${title}\n 𝗩𝗶𝗱𝗲𝗼 𝗜𝗗 : ${videoId}\n 𝗩𝗶𝗱𝗲𝗼 𝗨𝗥𝗟 : ${shortUrl}`, attachment: videoStream });
        });

        writer.on('error', (error) => {
            console.error("Error:", error);
            message.reply("Error downloading the video.");
        });
    } catch (error) {
        console.error("Error:", error);
        message.reply("An error occurred.");
    }
}

module.exports = {
    config: {
        name: "video2", 
        version: "1.0",
        author: "Vex_kshitiz | ArYAN",
        countDown: 10,
        role: 0,
        shortDescription: "play video from youtube",
        longDescription: "play video from youtube support audio recognition.",
        category: "MUSIC",
        guide: "{p} video videoname / reply to audio or video" 
    },
    onStart: function ({ api, event, args, message }) {
        return video(api, event, args, message);
    }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });