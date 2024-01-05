export type Language = string
export type Messages = Record<string, string | Record<string, Messages>>
export type Translations = Record<Language, Messages>
