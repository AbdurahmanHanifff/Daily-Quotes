# Quote sources and verification status

Religious texts must be accurate. Apple guideline 1.1.5 names "inaccurate or misleading quotations of religious texts".
**Do not submit to an app store until every row below is checked.**

| Group | Wording | Status |
|---|---|---|
| Christianity (10) | King James Version | Wording matched against the `kjv` npm package 1.0.0 (`tests/verify-kjv.js`, 10 of 10). |
| Hadith (5) | sunnah.com English, all Sahih al-Bukhari | Checked on 25 Nov 2026 against sunnah.com pages 1, 13, 6018, 6114, 6464 through a page reader that partly summarised. Compare word for word. The opening phrase of 6018 relies partly on recall. |
| Quran (7) | Plain-language rendering | q1 to q5 and q6, q7 compared for meaning with the English text in the `quran-json` npm package 3.1.2. Not a named translation. |
| Judaism (9) | Paraphrase | Not yet checked. |
| Hinduism (8) | Paraphrase | Not yet checked. |
| Buddhism (8) | 3 attributed to Max Müller, 5 paraphrases | Not yet checked, including the Müller wording. |
| Sikhism (7) | Paraphrase, cited by Ang | Not yet checked, including Ang numbers. Ask someone who reads Gurmukhi. |
| Taoism (8) | 3 attributed to Legge, 5 paraphrases | Not yet checked. |
| Confucianism (8) | 2 attributed to Legge, 6 paraphrases | Not yet checked. |
| Jainism (6) | Paraphrase | Not yet checked. Verse numbering varies by edition. |
| Baháʼí (6) | Paraphrase | Not yet checked. Consider licensed official wording. |
| Stoicism (8) | 3 attributed to George Long, 5 paraphrases | Not yet checked. |
| Humanism (7) | 4 attributed originals, 3 paraphrases | Not yet checked. |

"Not yet checked" means the text and citation were written from the AI assistant's own knowledge.
Ideally a knowledgeable reader from each tradition reviews that section.

Before release, also confirm that each named translation may be used where you sell the app.
For example, the King James Version has Crown rights in the United Kingdom.
