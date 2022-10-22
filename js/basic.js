/*
	Typewriter Style Text
*/
const _LOCALES = ['en', 'da'];
let TypeWriterActive = false;
let CurrentActiveLanguage = navigator.userLanguage || navigator.language;
CurrentActiveLanguage = _LOCALES.includes(CurrentActiveLanguage.substring(0,2)) ? CurrentActiveLanguage.substring(0,2) : 'en'

/**
 * Writes text similar to that of a typewriter.
 *
 * @param {string} id The ID of the element to edit.
 * @param {string} word The word to write.
 * @param {number} dspeed Speed in milliseconds of erasing every individual letter, defaults to 150.
 * @param {number} wspeed Speed in milliseconds of writing every individual letter, defaults to 150.
 * @return {boolean} Whether successful or not.
 */
function write(id,word,dspeed,wspeed) {
	return new Promise((resolve) => {
		const element = document.querySelector(`[lang="${CurrentActiveLanguage}"][id="${id}"]`)
		
		// Failsafe
		if(TypeWriterActive || word.length <= 0 || !isNaN(word) || word.length > 16) return;
		
		blinkingCursor(element)
		
		TypeWriterActive = true;
		
		// Erasing our current word
		let erase = setInterval(function() {
			if(element.innerHTML.length == 0) {
				clearInterval(erase)
				erase = null;
				// Hard-coded exceptions for the English language.
				// Just checking for the letter isn't going to work, A vs An is based on sound, not letter.
				if(CurrentActiveLanguage == "en" && id == "what-adj") {
					const _EXCEPTIONS = ["enthusiastic","astute"]
					document.getElementById("what-pre").innerHTML = _EXCEPTIONS.includes(word) ? "An" : "A"
				}
			}
			if(element.innerHTML.length > 0) {
				element.innerHTML = element.innerHTML.substring(0,element.innerHTML.length-1)
			}
		},(!isNaN(dspeed) && dspeed > 0 ? dspeed : 150))
		
		// Writing our new word
		let i=0;
		let write = setInterval(function() {
			if(element.innerHTML == word) {
				clearInterval(write);
				write = null;
				TypeWriterActive = false
				resolve(true);
			}
			if(element.innerHTML.length < word.length && erase == null) {
				element.innerHTML+=word.charAt(i++)
			}
		},(!isNaN(wspeed) && wspeed > 0 ? wspeed : 150))
	})
}

/**
 * Adds a blinking cursor similar to that of a word document or otherwise.
 *
 * @param {element} e The element to move the cursor to.
 */
function blinkingCursor(e) {
	let cursor = document.querySelector("#what-cursor");
	e.after(cursor);
}

/**
 * A dot function for formatting custom inline functions for projects page.
 *
 * @param {o} json Our current json object.
 * @return {string} Formatted string.
 */
String.prototype.format = function(o) {
	return this
		   // Format \n -> <br> ; Newlines
		   .replace(/\n/g, "<br>")
		   // Format %ls -> <a href=<object_link>> ; Object Link Start
		   .replace(/\%ls/g, `<a href='${o['link']}' target='_blank'>`)
		   // Format %as[<link>] -> <a href=<link>> ; Link content
		   .replace(/\%as\[(.*?)\]/g, `<a href='$1' target='_blank'>`)
		   // Format %ae -> </a> ; Link end
		   .replace(/\%ae/g, `</a>`)
};

/**
 * A recursive projects page populator.
 *
 * @param {json} json Our JSON file.
 */
function populateProjects(json) {
	if(Object.keys(json.Projects).length == 0) return;
	const _FIRST_OBJECT = json.Projects[Object.keys(json.Projects)[0]]
	/*if(document.querySelector("div[id^=row-]:last-child") === null || document.querySelector("div[id^=row-]:last-child").length === 0) {
		document.querySelector("#portfolio .content").innerHTML += "<div class='row' id='row-1'></div>"
	} else if(document.querySelectorAll("div[id^=row-]:last-child > *").length >= 4) {
		document.querySelector("#portfolio .content").innerHTML += `<div class='row' id='row-${parseInt(document.querySelector("div[id^=row-]:last-child").id.split("-")[1])+1}'></div>`
	}*/
	const _CURRENT_ROW      = document.querySelector("#displayRow")
	let _CURRENT_BOX        = `<div class='contentbox ${Object.keys(json.Projects)[0]}'></div>`
	_CURRENT_ROW.innerHTML += _CURRENT_BOX
	_CURRENT_BOX            = _CURRENT_ROW.querySelector(".contentbox:last-child")
	
	// No longer does, I have to do unique code execution based on type :(
	//* Rids us some code duplication.
	//const _TYPES            = ['name','','body']
	if('name' in _FIRST_OBJECT) {
		_CURRENT_BOX.innerHTML += `<a href='${_FIRST_OBJECT['link']}' target='_blank'><div class='box-header'>${_FIRST_OBJECT['name'][0]}</div></a>`
		// Despite this checking for a length bigger than 1, we only support 2 languages.
		if(_FIRST_OBJECT['name'].length > 1) {
			_CURRENT_BOX.querySelector(`.box-header`).setAttribute("lang", "en")
			_CURRENT_BOX.innerHTML += `<a href='${_FIRST_OBJECT['link']}' target='_blank'><div class='box-header' lang="da">${_FIRST_OBJECT['name'][1]}</div></a>`
		}
	}
	if('images' in _FIRST_OBJECT) {
		// Add carousel if we have multiple images, else don't.
		if(_FIRST_OBJECT['images'].length > 1) {
			_CURRENT_BOX.innerHTML += `<div class='box-image'><section id="image-carousel" class="splide" aria-label="${_FIRST_OBJECT['name']}"><div class="splide__track"><ul class="splide__list"></ul></div></section></div>`
			for (const property in _FIRST_OBJECT['images']) {
				_CURRENT_BOX.querySelector(".splide__list").innerHTML += `<li class="splide__slide"><a href='${_FIRST_OBJECT['link']}' target='_blank'><img src="${_FIRST_OBJECT['images'][property]}"></a></li>`
			}
		} else {
			_CURRENT_BOX.innerHTML += `<div class='box-image' aria-label="${_FIRST_OBJECT['name']}"></div>`
			_CURRENT_BOX.querySelector(".box-image").innerHTML += `<a href='${_FIRST_OBJECT['link']}' target='_blank'><img src="${_FIRST_OBJECT['images'][0]}"></a>`
		}
	}
	if('body' in _FIRST_OBJECT) {
		_CURRENT_BOX.innerHTML += `<div class='box-body'>${_FIRST_OBJECT['body'][0]}</div>`
		// Despite this checking for a length bigger than 1, we only support 2 languages.
		if(_FIRST_OBJECT['body'].length > 1) {
			_CURRENT_BOX.querySelector(`.box-body`).setAttribute("lang", "en")
			_CURRENT_BOX.innerHTML += `<div class='box-body' lang="da">${_FIRST_OBJECT['body'][1]}</div>`
		}
		_CURRENT_BOX.querySelectorAll(`.box-body`).forEach((item) => item.innerHTML = item.innerHTML.format(_FIRST_OBJECT))
	}
	if('footer' in _FIRST_OBJECT) {
		_CURRENT_BOX.innerHTML += `<div class="box-footer"><div class="box-break"></div><div class="box-footer-data"></div></div>`
		if('date' in _FIRST_OBJECT['footer']) {
			_CURRENT_BOX.querySelector(`.box-footer-data`).innerHTML += `<div class="box-footer-date">${_FIRST_OBJECT['footer']['date']}</div>`
		}
		if('language' in _FIRST_OBJECT['footer']) {
			_CURRENT_BOX.querySelector(`.box-footer-data`).innerHTML += `<div class="box-footer-language cl-${_FIRST_OBJECT['footer']['language']}">${_FIRST_OBJECT['footer']['language']}</div>`
		}
	}
	
	delete json.Projects[Object.keys(json.Projects)[0]]
	populateProjects(json)
}

window.onload = function() {
	const _NOUN_TIME    = 4000;
	const _ADJ_TIME     = 2350;
	const _CURSOR_BLINK = 500;
	const _WRITE_SPEED  = 150;
	
	// Honey, I'm home!
	document.querySelector("#home").classList.toggle("section-show")
	// Populate projects, this may take a second...
	populateProjects(projects);
	// Hide unusued language
	document.querySelectorAll(`body *[lang=${_LOCALES[+!_LOCALES.indexOf(CurrentActiveLanguage)]}]`).forEach((node) => node.style.display = 'none');
	// Set active language
	document.querySelector(`#lang-${CurrentActiveLanguage}`).classList.toggle("active-language")
	
	// Mount all image carousels, splide necessity.
	new Splide( '#image-carousel' ).mount();
	
	let adjIndex=0;
	let nounIndex=0;
	setInterval(function() {
		write("what-noun",_WORDS_JSON.Nouns[nounIndex][CurrentActiveLanguage],_WRITE_SPEED,_WRITE_SPEED).then((success) => {
			if(success) {
				nounIndex=nounIndex>=_WORDS_JSON.Nouns.length-1?0:nounIndex+1;
			}
		}).catch((e) => {
			return console.error(e);
		})
	},_NOUN_TIME)
	setInterval(function() {
		write("what-adj",_WORDS_JSON.Adjectives[adjIndex][CurrentActiveLanguage],_WRITE_SPEED,_WRITE_SPEED).then((success) => {
			if(success) {				
				adjIndex=adjIndex>=_WORDS_JSON.Adjectives.length-1?0:adjIndex+1;
			}
		}).catch((e) => {
			return console.error(e);
		})
	},_ADJ_TIME)
	setInterval(function() {
		if(!TypeWriterActive) {
			document.querySelector("#what-cursor").style.display = (document.querySelector("#what-cursor").style.display == "none") ? "" : "none";
		} else {
			document.querySelector("#what-cursor").style.display = "";
		}
	},_CURSOR_BLINK)
	
	document.querySelectorAll("#navbar #navbox ul li a").forEach((item) => { item.addEventListener("click", function() {
		if(item.classList[1] == "active") return;
		const _CUR_ACTIVE = document.querySelector(".nav-link.active");
		
		_CUR_ACTIVE.classList.toggle("active");
		document.querySelector(_CUR_ACTIVE.getAttribute("href")).classList.toggle("section-show");
		document.querySelector(item.getAttribute("href")).classList.toggle("section-show");
		item.classList.toggle("active");
	})})

	document.querySelectorAll(".btn-popup, #close").forEach((item) => { item.addEventListener("click", function (data) {
			const _OUR_TARGET    = data.target.tagName == "IMG" ? findAncestor(data.target,".popup").id : `${data.target.id}-popup`;
			const _POPUP_ELEMENT = document.querySelector(`#${_OUR_TARGET}`);
			if(_POPUP_ELEMENT.classList.value.indexOf("popup-active") > -1) {
				_POPUP_ELEMENT.querySelector(".popup-text-active").classList.toggle("popup-text-active");
			} else {
				_POPUP_ELEMENT.classList.toggle("popup-active");
			}
		});
	});
	
	document.querySelector("#copy img").addEventListener("click", function () {
		navigator.clipboard.writeText("wollausteffen@gmail.com");
		document.querySelector(".popup-tooltip-box").classList.toggle("popup-tooltip-box-active");
	});
	
	document.querySelector(".popup").addEventListener("transitionend", function (data) {
		if(data.target.classList[0] == "popup" && data.target.classList.length == 2 && data.propertyName == "width") {
			document.querySelector(".popup-text").classList.toggle("popup-text-active");
		} else if(data.target.classList[0] == "popup-text" && data.propertyName == "opacity" && data.target.classList.value.indexOf("popup-text-active") == -1) {
			data.target.parentElement.parentElement.classList.toggle("popup-active");
		}
	});
	
	document.querySelector(".popup").addEventListener("animationend", function (data) {
		if(data.target.classList[0] == "popup-tooltip-box") document.querySelector(".popup-tooltip-box").classList.toggle("popup-tooltip-box-active");
	});
	
	/*
		Localize Function for Language Handling
	*/
	document.querySelectorAll(".language").forEach((item) => {
		item.addEventListener("click", function (data) {
			let language = data.target.parentElement.id.split("-")[1] 
			if(_LOCALES.includes(language) && language != CurrentActiveLanguage) {
				document.querySelector(".active-language").classList.toggle("active-language");
				data.target.parentElement.classList.toggle("active-language");
				document.querySelectorAll("body *[lang]").forEach(function (node) {
					CurrentActiveLanguage = language;
					if(node.lang != language) {
					  node.style.display = 'none';
					} else {
					  node.style.display = '';
					}
				});
			}
		});
	});
}

/*
	https://stackoverflow.com/questions/22119673/find-the-closest-ancestor-element-that-has-a-specific-class
*/
function findAncestor (el, sel) {
    while ((el = el.parentElement) && !((el.matches || el.matchesSelector).call(el,sel)));
    return el;
}