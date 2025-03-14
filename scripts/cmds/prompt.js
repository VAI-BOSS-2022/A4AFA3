const { GoatWrapper } = require("fca-liane-utils");
const axios = require('axios');
const ok = 'xyz';

module.exports = {
 config: {
 name: "prompt",
 aliases: ["p"],
 version: "1.3",
 author: "Team Calyx | Fahim_Noob",
 countDown: 5,
 role: 0,
 longDescription: {
 vi: "",
 en: "Get gemini prompts."
 },
 category: "IMAGE"
 },
 onStart: async function ({ message, event, args, api }) {
 try {
 const promptText = args.join(" ");
 let imageUrl;
 let response;

 if (event.type === "message_reply") {
 if (["photo", "sticker"].includes(event.messageReply.attachments[0]?.type)) {
 imageUrl = event.messageReply.attachments[0].url;
 } else {
 return message.reply("❌ | Reply must be an image.");
 }
 } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
 imageUrl = args[0];
 } else if (!promptText) {
 return message.reply("❌ | Reply to an image or provide a prompt.");
 }

 if (["-r", "-random"].includes(promptText.toLowerCase())) {
 response = await axios.get(`https://smfahim.${ok}/prompt-random`);
 const description = response.data.data.prompt;
 await message.reply(description);
 } else if (["-anime", "-a"].some(flag => promptText.toLowerCase().includes(flag))) {
 response = await axios.get(`https://smfahim.${ok}/prompt2?url=${encodeURIComponent(imageUrl || promptText)}`);
 if (response.data.code === 200) {
 const description = response.data.data;
 await message.reply(description);
 } else {
 await message.reply("❌ | Failed to retrieve prompt data.");
 }
 } else if (imageUrl) {
 response = await axios.get(`https://smfahim.${ok}/prompt?url=${encodeURIComponent(imageUrl)}`);
 const description = response.data.result;
 await message.reply(description);
 } else {
 response = await axios.get(`https://smfahim.${ok}/prompt?text=${encodeURIComponent(promptText)}`);
 const description = response.data.prompt || response.data.result;
 await message.reply(description);
 }

 } catch (error) {
 message.reply(`❌ | An error occurred: ${error.message}`);
 }
 }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });