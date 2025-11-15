import { useDispatch, useSelector } from "react-redux"
import { setLanguage } from "@/lib/store"

const languages = {
  en: "English",
  hi: "Hindi",
  fr: "French",
  tr: "Turkish",
  es: "Spanish",
  ta: "Tamil",
  mr: "Marathi",
}

export default function LanguageSelector() {
  const selected = useSelector((state) => state.language.selected)
  const dispatch = useDispatch()

  return (
    <select
      value={selected}
      onChange={(e) => dispatch(setLanguage(e.target.value))}
      className="p-2 rounded-md border border-gray-300"
    >
      {Object.entries(languages).map(([code, label]) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  )
}
