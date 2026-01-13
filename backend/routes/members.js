import express from 'express';
import prisma from '../lib/prisma.js';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import { extractMembersFromText } from '../services/gemini.js';

const router = express.Router();
export const publicMembersRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Utility to extract text from uploaded files
async function extractTextFromFile(file) {
  const buffer = fs.readFileSync(file.path);
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    const pdfData = await pdfParse(buffer);
    return pdfData.text;
  }
  return buffer.toString('utf-8');
}

// Robust parser for member row
function parseMemberRow(row) {
  if (!row) return null;

  // Skip unwanted headers or separators
  const skipPatterns = [
    /^NameGender/i,
    /^\*\*\*/,
    /^Count:/i,
    /^Sunday School/i,
    /^Rexburg/i,
    /^For Church Use Only/i
  ];
  if (skipPatterns.some(p => p.test(row))) return null;

  // Remove emails, phones, dates
  let clean = row
    .replace(/\S+@\S+\.\S+/g, ' ')               // emails
    .replace(/(\+?\d[\d\s\-]{7,}\d)/g, ' ')     // phones
    .replace(/\b\d{1,2}\s?[A-Za-z]{3}\b/g, ' ') // dates
    .replace(/[^a-zA-ZÀ-ÿ\s,]/g, ' ')           // letters, spaces, commas
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return null;

  // Extract gender (first M or F in the row)
  let gender = 'MALE';
  const genderMatch = clean.match(/\b(M|F)\b/);
  if (genderMatch) {
    gender = genderMatch[1].toUpperCase() === 'F' ? 'FEMALE' : 'MALE';
    clean = clean.replace(/\b(M|F)\b/, '').trim();
  }

  // Extract full name
  let name = clean;

  if (clean.includes(',')) {
    // Last, First Middle
    const [last, first] = clean.split(',').map(s => s.trim());
    name = `${first} ${last}`;
  } else {
    // Take first 2-4 words as name
    const words = clean.split(' ');
    name = words.slice(0, 4).join(' ');
  }

  return { name, gender };
}

/* ===================================================== */
/* ===================== MEMBERS API ================== */
/* ===================================================== */

// Get all members
router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({ orderBy: { name: 'asc' } });

    const formatted = members.map(m => ({
      ...m,
      _id: m.id.toString(),
      gender: m.gender.toLowerCase(),
      category: m.category.toLowerCase().replace('_', '-')
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single member
router.get('/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!member) return res.status(404).json({ message: 'Member not found' });

    res.json({
      ...member,
      _id: member.id.toString(),
      gender: member.gender.toLowerCase(),
      category: member.category.toLowerCase().replace('_', '-')
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create member
router.post('/', async (req, res) => {
  try {
    const { name, gender, category, email, phone } = req.body;

    const member = await prisma.member.create({
      data: {
        name,
        gender: gender.toUpperCase(),
        category: category.toUpperCase().replace('-', '_'),
        email: email || null,
        phone: phone || null
      }
    });

    res.status(201).json({
      ...member,
      _id: member.id.toString(),
      gender: member.gender.toLowerCase(),
      category: member.category.toLowerCase().replace('_', '-')
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update member
router.put('/:id', async (req, res) => {
  try {
    const { name, gender, category, email, phone } = req.body;

    const member = await prisma.member.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        gender: gender.toUpperCase(),
        category: category.toUpperCase().replace('-', '_'),
        email: email || null,
        phone: phone || null
      }
    });

    res.json({
      ...member,
      _id: member.id.toString(),
      gender: member.gender.toLowerCase(),
      category: member.category.toLowerCase().replace('_', '-')
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete member
router.delete('/:id', async (req, res) => {
  try {
    await prisma.member.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all members
router.delete('/', async (req, res) => {
  try {
    await prisma.attendance.deleteMany({});
    await prisma.member.deleteMany({});
    res.json({ message: 'All members deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================================================== */
/* ============ PDF UPLOAD + AUTO PARSER ============== */
/* ===================================================== */

publicMembersRouter.post('/debug-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const buffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(buffer);

    // Save raw extracted text to a file so we can inspect it
    fs.writeFileSync('debug-output.txt', pdfData.text);

    fs.unlinkSync(req.file.path);

    return res.json({
      message: "PDF text extracted. Check debug-output.txt in your server root.",
      preview: pdfData.text.slice(0, 1000000)
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

publicMembersRouter.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const buffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(buffer);

    const text = pdfData.text.replace(/\u00A0/g, ' ');

    const extractedMembers = [];

    /**
     * PDF Format: "Last, FirstMiddleGENDERday month..."
     * Example: "Panibra Merma, Edson JoaquinM14 Nov..."
     * Gender M/F is attached to name, followed immediately by date
     */
    const rowRegex = /([^,\n]+),\s*([A-Za-z\s]+?)([MF])(\d{1,2}\s+[A-Za-z]{3})/g;

    let match;
    while ((match = rowRegex.exec(text)) !== null) {
      const lastName = match[1].trim();
      const firstName = match[2].trim();
      const gender = match[3] === 'F' ? 'FEMALE' : 'MALE';

      const fullName = `${firstName} ${lastName}`;

      extractedMembers.push({
        name: fullName,
        gender,
        category: 'REGULAR'
      });
    }

    if (extractedMembers.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Could not find any members in the PDF.' });
    }

    const inserted = await prisma.member.createMany({
      data: extractedMembers,
      skipDuplicates: true
    });

    fs.unlinkSync(req.file.path);

    res.json({
      message: `Imported ${inserted.count} members`,
      members: extractedMembers
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
});

/* ===================================================== */
/* ============ AI FILE UPLOAD (Gemini) =============== */
/* ===================================================== */

router.post('/ai-upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const text = await extractTextFromFile(req.file);
    const membersFromAI = await extractMembersFromText(text);

    const cleanedMembers = membersFromAI
      .map(m => parseMemberRow(m.name))
      .filter(m => m && m.name)
      .map(m => ({
        name: m.name,
        gender: m.gender.toUpperCase(),
        category: 'REGULAR',
        email: null,
        phone: null
      }));

    const created = await prisma.member.createMany({
      data: cleanedMembers,
      skipDuplicates: true
    });

    fs.unlinkSync(req.file.path);

    res.json({
      message: `Imported ${created.count} members with Gemini`,
      count: created.count
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
});

export default router;
