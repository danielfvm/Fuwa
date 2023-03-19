/**** Useful functions and variables ****/
const SERVER_URL = "http://127.0.0.1:8875/";
let THEME;

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

const getByTagAndClass = (tag, clazzes) => {
	return Array.from(document.getElementsByTagName(tag))
		.filter(x => clazzes.filter((clazz) => x.className.includes(clazz)).length == clazzes.length)
}

const removeClass = (dom, clazz) => {
	for (const c of dom.classList) {
		if (c.includes(clazz)) {
			dom.classList.remove(c);
		}
	}
}


/**** Emojis & Stickers ****/
const hookEmojis = () => getByTagAndClass("button", ["emojiItemDisabled"]).forEach(x => {
	x.onclick = () => {
		getByTagAndClass("button", ["emojiButtonHovered"])[0].click();
		setTimeout(() => fetch(SERVER_URL + encodeURIComponent(x.children[0].src)), 0);
	};
	x.onmouseover = () => {
		hookEmojis();
	}
	removeClass(x, "emojiItemDisabled");
});

const hookStickers = () => getByTagAndClass("div", ["stickerUnsendable"]).forEach(x => {
	x.onclick = () => {
		getByTagAndClass("div", ["stickerButton"])[0].click();
		setTimeout(() => fetch(SERVER_URL + encodeURIComponent(x.children[0].children[0].src)), 0);
	};
	removeClass(x, "stickerUnsendable");
});




/**** Themes ****/
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

	setTimeout(() => fetch(SERVER_URL + encodeURIComponent(name)), 0);
}

const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		if (!mutation.target.classList.contains("custom-theme-background")) {
			mutation.target.classList.add("custom-theme-background");
		}
	});
});

observer.observe($("html"), {
	attributes: true,
	attributeFilter: ['class']
});

const hookTheme = () => getByTagAndClass("div", ["themeSelection"]).forEach(x => {
	if (!x.parentNode.className.includes("themeSelectionContainer")) {
		return;
	}

	x.onclick = () => {
		applyTheme(x.ariaLabel);
		setTimeout(() => fetch(SERVER_URL + encodeURIComponent(x.ariaLabel)), 0);
	};
	removeClass(x, "disabled");
});


/**** Update Loop ****/
const interval = setInterval(() => {
	hookEmojis();
	hookStickers();
	hookTheme();
}, 100);

applyTheme(THEME);
