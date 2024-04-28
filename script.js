let wpRequire, request, db;

window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => wpRequire = req]);
request = window.indexedDB.open("ThemeDatabase", 1);

const themes = {
	'Mint Apple': '--custom-theme-background: linear-gradient(180deg, var(--bg-gradient-mint-apple-1) 6.15%, var(--bg-gradient-mint-apple-2) 48.7%, var(--bg-gradient-mint-apple-3) 93.07%);',
	'Citrus Sherbert': '--custom-theme-background: linear-gradient(180deg, var(--bg-gradient-citrus-sherbert-1) 31.1%, var(--bg-gradient-citrus-sherbert-2) 67.09%);',
	'Retro Raincloud': '--custom-theme-background: linear-gradient(148.71deg, var(--bg-gradient-retro-raincloud-1) 5.64%, var(--bg-gradient-retro-raincloud-2) 26.38%, var(--bg-gradient-retro-raincloud-2) 49.92%, var(--bg-gradient-retro-raincloud-1) 73.12%);',
	'Hanami': '--custom-theme-background: linear-gradient(38.08deg, var(--bg-gradient-hanami-1) 3.56%, var(--bg-gradient-hanami-2) 35.49%, var(--bg-gradient-hanami-3) 68.78%);',
	'Sunrise': '--custom-theme-background: linear-gradient(154.19deg, var(--bg-gradient-sunrise-1) 8.62%, var(--bg-gradient-sunrise-2) 48.07%, var(--bg-gradient-sunrise-3) 76.04%);',
	'Candyfloss': '--custom-theme-background: linear-gradient(180.14deg, var(--bg-gradient-cotton-candy-1) 8.5%, var(--bg-gradient-cotton-candy-2) 94.28%);',
	'LoFi Vibes': '--custom-theme-background: linear-gradient(179.52deg, var(--bg-gradient-lofi-vibes-1) 7.08%, var(--bg-gradient-lofi-vibes-2) 34.94%, var(--bg-gradient-lofi-vibes-3) 65.12%, var(--bg-gradient-lofi-vibes-4) 96.23%);',
	'Desert Khaki': '--custom-theme-background: linear-gradient(38.99deg, var(--bg-gradient-desert-khaki-1) 12.92%, var(--bg-gradient-desert-khaki-2) 32.92%, var(--bg-gradient-desert-khaki-3) 52.11%);',
	'Sunset': '--custom-theme-background: linear-gradient(141.68deg, var(--bg-gradient-sunset-1) 27.57%, var(--bg-gradient-sunset-2) 71.25%);',
	'Chroma Glow': '--custom-theme-background: linear-gradient(128.92deg, var(--bg-gradient-chroma-glow-1) 3.94%, var(--bg-gradient-chroma-glow-2) 26.1%, var(--bg-gradient-chroma-glow-3) 39.82%, var(--bg-gradient-chroma-glow-4) 56.89%, var(--bg-gradient-chroma-glow-5) 76.45%);',
	'Forest': '--custom-theme-background: linear-gradient(162.27deg, var(--bg-gradient-forest-1) 11.2%, var(--bg-gradient-forest-2) 29.93%, var(--bg-gradient-forest-3) 48.64%, var(--bg-gradient-forest-4) 67.85%, var(--bg-gradient-forest-5) 83.54%);',
	'Crimson Moon': '--custom-theme-background: linear-gradient(64.92deg, var(--bg-gradient-crimson-moon-1) 16.17%, var(--bg-gradient-crimson-moon-2) 72%);',
	'Midnight Blurple': '--custom-theme-background: linear-gradient(48.17deg, var(--bg-gradient-midnight-blurple-1) 11.21%, var(--bg-gradient-midnight-blurple-2) 61.92%);',
	'Mars': '--custom-theme-background: linear-gradient(170.82deg, var(--bg-gradient-mars-1) 14.61%, var(--bg-gradient-mars-2) 74.62%);',
	'Dusk': '--custom-theme-background: linear-gradient(180deg, var(--bg-gradient-dusk-1) 12.84%, var(--bg-gradient-dusk-2) 85.99%);',
	'Under the Sea': '--custom-theme-background: linear-gradient(179.14deg, var(--bg-gradient-under-the-sea-1) 1.91%, var(--bg-gradient-under-the-sea-2) 48.99%, var(--bg-gradient-under-the-sea-3) 96.35%);',
};



/**** DevTools ****/
document.addEventListener("keydown", (e) => {
    if (e.key == "F12") {
        require("electron").remote.BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
    } else if (e.key == "F5") {
        location.reload();
    }
});



/**** Helper Functions ****/
const removeClass = (dom, clazz) => {
	dom.classList.forEach((c) => {
		if (c.includes(clazz))
			dom.classList.remove(c);
	});
};

const getChannelId = () =>
	document.querySelector('li[class^="messageListItem"]').id.split('-')[2];

const sendMessage = (message) =>
	!message || wpRequire.c[904245].exports.default.sendMessage(getChannelId(), {content: message});

const applyTheme = (name) => {
	if (!(name in themes)) {
		return;
	}

	const styleTag = document.getElementById("freeNitroTheme") || document.createElement("style");

	if (styleTag.id != "freeNitroTheme") {
		styleTag.id = "freeNitroTheme";
		document.getElementsByTagName("head")[0].appendChild(styleTag);
	}

	styleTag.innerHTML = ".custom-theme-background {\n" + themes[name] + "\n}";
	saveTheme(name);
}



/**** MutationObserver ****/
const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => mutation.target.classList.toggle("custom-theme-background", true));
});

observer.observe($("html"), {
	attributes: true,
	attributeFilter: ['class']
});



/**** IndexedDB ****/
request.onsuccess = function(event) {
	db = event.target.result;
	getTheme();
};

request.onupgradeneeded = function(event) {
	db = event.target.result;
	db.createObjectStore("themes", { keyPath: "id" });
	console.log("Object store created successfully");
};

const saveTheme = (theme) => {
	const transaction = db.transaction(["themes"], "readwrite");
	const objectStore = transaction.objectStore("themes");
	objectStore.put({ id: 1, theme: theme });
};

const getTheme = () => {
	const transaction = db.transaction(["themes"], "readonly");
	const objectStore = transaction.objectStore("themes");
	const request = objectStore.get(1);

	request.onsuccess = function(event) {
		if (request.result) {
			console.log("Current theme: " + request.result.theme);
			applyTheme(request.result.theme);
		} else {
			console.log("No theme set yet");
		}
	};
};



/**** Update Loop ****/
const interval = setInterval(() => {
	document.querySelectorAll('[class*="themeSelectionContainer"]').forEach(div => {
		div.onclick = () => applyTheme(div.firstChild.ariaLabel);
		removeClass(div.firstChild, "disabled");
	});

	// Remove the "Nitro only" banner and lock symbols over emojis
	document.querySelector('[class^="upsellWrapper"]')?.remove();
	document.querySelector('[class^="upsellContainer"]')?.remove();
	document.querySelectorAll('[class^="emojiLockIconContainer"]').forEach(div => div.remove());
	document.querySelector('[class^="premiumPromo"]')?.remove();
	document.querySelectorAll('[class^="shinyButton"]').forEach(btn => btn.remove());

	const premBorder = document.querySelector('[class^="premiumFeatureBorder"]');
	if (premBorder)
		premBorder.classList = "";

	// Send emoji image link on emoji click
	document.querySelectorAll('[data-type="emoji"]').forEach(btn => {
		btn.onclick = () => sendMessage(btn.firstChild.src.replace("?size=80", "?size=40"));
	});

	// Send sticker image link on sticker click
	document.querySelectorAll('[data-type="sticker"]').forEach(img => {
		img.onclick = () => sendMessage(img.src);
		removeClass(img.parentNode.parentNode, "stickerUnsendable");
	});
}, 200);
