'use strict';

const userId = '@elite9gag';//242171891;
const spacesPerCommentDepth = 4;
const memesCount = 5;
const memesType = 'trending';
const memesComments = 4;
const memesDelayMinutes = 1;

const GagScraper = require('9gag').Scraper;
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const token = fs.readFileSync('TelegramBot.token', 'utf8');
const bot = new TelegramBot (token, {polling : true});

let lastIds = [];

async function getMemes (count = 3, type = 'hot', comments = 4) {
	
    const scraper = new GagScraper (count, type, comments);
	
    try {
		
		var res = [];
		
        const posts = await scraper.scrap();
        posts.forEach(post => {
			
			res.push (post);
		});
		
		return res;
    } catch (err) {
		
        console.error(err);
		return [];
    }
}

function commentSpaces (count) {
	
	let res = '';
	
	for (var i = 0; i < count; i++) {
		
		res += ' ';
	}
	
	return res;
}

function printCommentValue (comment, depth) {
	
	return commentSpaces (depth * spacesPerCommentDepth) + `<b>@${comment.user}</b>(+${comment.likes}):`
		+ comment.content.replace ('\n', '\n' + commentSpaces (depth * spacesPerCommentDepth));
}

function printComments (comments, depth = 0.5) {
	
	let res = '';
	
	comments.forEach (comment => {
		
		if (comment != undefined && comment.type == 'Text') {

			res += printCommentValue (comment, depth);
			res += "\n";
			res += printComments ([comment.reply], depth + 1);
		}
	});
	
	return res;
}

function printMeme (meme) {
	
	let comments = printComments (meme.comments);
	
	return [
        
        {message:`<a href="${meme.content}">+${meme.upVoteCount}</a>\n${meme.title}`
            , options: {parse_mode: 'HTML'}
        }
        , {message:`<a href="${meme.url}">Comments:</a>\n${comments}`
            , options: {parse_mode: 'HTML', disable_web_page_preview: true}
        }
    ];
}

function isShownMeme (meme) {

	return lastIds.includes (meme.id);
}

async function findMemes () {
	
	const memesList = await getMemes (memesCount, memesType, memesComments);
	  
	let printed = 0;  
	  
      
    for (const meme of memesList) {  
            
        if (!isShownMeme (meme)) {
      
            const memeMessages = printMeme (meme);
            
            for (const memeMessage of memeMessages) {
      
                await bot.sendMessage(userId, memeMessage.message, memeMessage.options);
            }
            printed ++;
        }
    }
	
	if (lastIds.length > memesCount * 200) {
		
		lastIds = memesList.map (meme => meme.id);
	} else {
		
		lastIds.push (...memesList.filter (meme => !isShownMeme (meme)).map (meme => meme.id));
	}
	
	console.log ('Printed: ' + printed);
}

bot.onText(/\/start/, async (msg, match) => {

	const chatId = msg.chat.id;
	
	bot.sendMessage(chatId, 'Id: ' + chatId);
});

findMemes ();
const finder = setInterval (findMemes, memesDelayMinutes * 60 * 1000);