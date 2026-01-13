import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. Gemini-powered imports will be disabled.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Use a model name that is available to generateContent for the current API version
const modelName = 'gemini-1.5-flash-latest';

function normalizeMember(member) {
  if (!member || !member.name) return null;
  const genderRaw = (member.gender || '').toString().toUpperCase();
  const categoryRaw = (member.category || '').toString().toUpperCase();

  const gender = genderRaw.includes('F') ? 'FEMALE' : 'MALE';
  const category = categoryRaw.includes('TEMPLE')
    ? 'TEMPLE_PREP'
    : categoryRaw.includes('MISSION')
      ? 'MISSION_PREP'
      : 'REGULAR';

  return {
    name: member.name.trim(),
    gender,
    category,
    email: member.email || null,
    phone: member.phone || null
  };
}

export async function extractMembersFromText(text) {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in your environment.');
  }

  const prompt = `You will receive raw text from a Sunday School roster. Extract members and return ONLY a JSON array (no code fences, no prose). Each item must have: \n\nname (string), gender (MALE or FEMALE), category (REGULAR, TEMPLE_PREP, or MISSION_PREP), optional email, optional phone. \n\nIf category is unclear, default to REGULAR. If gender is unclear, infer from context or default to MALE. Keep the response minimal.`;

  const model = genAI.getGenerativeModel({ model: modelName });
  const limitedText = text.length > 12000 ? text.slice(0, 12000) : text;

  const result = await model.generateContent([
    { text: prompt },
    { text: `Raw roster text:\n${limitedText}` }
  ]);

  const response = await result.response;
  const rawText = response.text();

  // Try to locate the first JSON array in the response
  const match = rawText.match(/\[.*\]/s);
  if (!match) {
    throw new Error('Gemini response did not contain a JSON array.');
  }

  let parsed;
  try {
    parsed = JSON.parse(match[0]);
  } catch (err) {
    throw new Error('Failed to parse Gemini JSON response.');
  }

  const normalized = parsed
    .map(normalizeMember)
    .filter(Boolean)
    .filter((m) => m.name);

  if (normalized.length === 0) {
    throw new Error('No members detected in file. Please ensure the file has names and genders.');
  }

  return normalized;
}
