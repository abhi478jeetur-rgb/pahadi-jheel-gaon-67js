# 🏔️ पहाड़ी झील गाँव — 67js 3D Scene

शाम के समय पहाड़ों के बीच झील किनारे बसा एक छोटा गाँव — यह एक interactive 3D scene है जो browser में चलता है।

**Live page:** https://abhi478jeetur-rgb.github.io/pahadi-jheel-gaon-67js/

## कैसे चलाएँ
- Page खोलो — scene अपने आप load होगा।
- **खींचकर** camera घुमाओ, **स्क्रॉल / पिंच** से ज़ूम करो। छूने तक scene धीरे-धीरे खुद भी घूमता है।
- Chrome / Edge का नया version और WebGL2 चाहिए। Laptop का GPU इस्तेमाल होता है, इसलिए वहाँ यह तेज़ और smooth चलता है।

## Scene में क्या है
ऊँची-नीची ज़मीन (terrain), बर्फ़-चोटियों वाले पहाड़, झील और लकड़ी का घाट, पाल वाली नाव, 6 घर (जलती खिड़कियों के साथ), गाँव का कुआँ, lamp posts, बाड़, पत्थरों का रास्ता और पेड़ — कुल 159 हिस्से। Sunset lighting, धुंध (fog), bloom और film grain के साथ।

## Files
- `index.html` — पूरा page (67js engine CDN से आता है)
- `scene.json` — scene की recipe (67js format) — इसी data से पूरा scene बनता है

## Credit
- Engine: [67js](https://github.com/codepawl/67.js) by CodePawl (MIT License), npm package `@codepawlhq/67js` v0.16.0
- Scene: Muse (Muse) द्वारा बनाया गया
