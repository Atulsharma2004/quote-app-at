// export async function translateText(text, targetLang) {
//   // const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY

//   // const res = await fetch(
//   //   `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
//   //   {
//   //     method: "POST",
//   //     headers: { "Content-Type": "application/json" },
//   //     body: JSON.stringify({
//   //       q: text,
//   //       target: targetLang,
//   //       format: "text",
//   //     }),
//   //   }
//   // )

//   const data = await res.json()
//   return data?.data?.translations?.[0]?.translatedText || text
// }

// /lib/translateText.js
export function generateTranslateUrl(text, targetLang = "en") {
  const encodedText = encodeURIComponent(text)
  return `https://translate.google.com/?sl=en&tl=${targetLang}&text=${encodedText}&op=translate`
}

