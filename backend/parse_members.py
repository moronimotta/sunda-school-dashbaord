#!/usr/bin/env python3
"""
Member Parser - Extract member data from PDF or text files
Based on the parsing logic from members.js
"""

import re
import sys
from pathlib import Path

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None
    print("Warning: PyPDF2 not installed. Install with: pip install PyPDF2")


def extract_text_from_file(file_path):
    """Extract text from PDF or text file"""
    path = Path(file_path)
    
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Handle PDF files
    if path.suffix.lower() == '.pdf':
        if PyPDF2 is None:
            raise ImportError("PyPDF2 required for PDF parsing. Install with: pip install PyPDF2")
        
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    
    # Handle text files
    else:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()


def parse_member_row(row):
    """
    Parse a single member row - similar to parseMemberRow in members.js
    Returns dict with name and gender, or None if invalid
    """
    if not row:
        return None
    
    # Skip unwanted headers or separators
    skip_patterns = [
        r'^NameGender',
        r'^\*\*\*',
        r'^Count:',
        r'^Sunday School',
        r'^Rexburg',
        r'^For Church Use Only'
    ]
    
    for pattern in skip_patterns:
        if re.search(pattern, row, re.IGNORECASE):
            return None
    
    # Remove emails, phones, dates
    clean = row
    clean = re.sub(r'\S+@\S+\.\S+', ' ', clean)  # emails
    clean = re.sub(r'\+?\d[\d\s\-]{7,}\d', ' ', clean)  # phones
    clean = re.sub(r'\b\d{1,2}\s?[A-Za-z]{3}\b', ' ', clean)  # dates
    clean = re.sub(r'[^a-zA-ZÀ-ÿ\s,]', ' ', clean)  # keep letters, spaces, commas
    clean = re.sub(r'\s+', ' ', clean).strip()  # normalize whitespace
    
    if not clean:
        return None
    
    # Extract gender (first M or F in the row)
    gender = 'MALE'
    gender_match = re.search(r'\b(M|F)\b', clean)
    if gender_match:
        gender = 'FEMALE' if gender_match.group(1).upper() == 'F' else 'MALE'
        clean = re.sub(r'\b(M|F)\b', '', clean).strip()
    
    # Extract full name
    name = clean
    
    if ',' in clean:
        # Format: Last, First Middle
        parts = clean.split(',', 1)
        if len(parts) == 2:
            last = parts[0].strip()
            first = parts[1].strip()
            name = f"{first} {last}"
    else:
        # Take first 2-4 words as name
        words = clean.split()
        name = ' '.join(words[:4])
    
    return {'name': name, 'gender': gender}


def extract_members_from_pdf(text):
    """
    Extract members from Gospel Doctrine PDF format
    Format: "Last, First\nGENDER\nBirth Date..."
    Example: "Adams, Morgan\nM\n29 Jan..."
    """
    # Replace non-breaking spaces
    text = text.replace('\u00A0', ' ')
    
    members = []
    
    # Pattern 1: Multi-line format (Last, First\nGENDER\nDate)
    # This matches the Gospel Doctrine format
    pattern1 = r'([A-ZÀ-ÿ][A-Za-zÀ-ÿ\s]+),\s*([A-ZÀ-ÿ][A-Za-zÀ-ÿ\s]+)\s*\n\s*([MF])\s*\n'
    
    for match in re.finditer(pattern1, text):
        last_name = match.group(1).strip()
        first_name = match.group(2).strip()
        gender_char = match.group(3)
        
        gender = 'FEMALE' if gender_char == 'F' else 'MALE'
        full_name = f"{first_name} {last_name}"
        
        members.append({
            'name': full_name,
            'gender': gender,
            'category': 'REGULAR'
        })
    
    # Pattern 2: Inline format (Last, FirstMiddleGENDERday month...)
    # This is the format from members.js
    if not members:
        pattern2 = r'([^,\n]+),\s*([A-Za-z\s]+?)([MF])(\d{1,2}\s+[A-Za-z]{3})'
        
        for match in re.finditer(pattern2, text):
            last_name = match.group(1).strip()
            first_name = match.group(2).strip()
            gender_char = match.group(3)
            
            gender = 'FEMALE' if gender_char == 'F' else 'MALE'
            full_name = f"{first_name} {last_name}"
            
            members.append({
                'name': full_name,
                'gender': gender,
                'category': 'REGULAR'
            })
    
    return members


def parse_members_file(file_path, use_pdf_regex=True):
    """
    Main function to parse members from a file
    
    Args:
        file_path: Path to the file (PDF or text)
        use_pdf_regex: If True, use the specific PDF regex pattern.
                       If False, parse line by line with parseMemberRow logic
    
    Returns:
        List of strings, one per member (formatted as "Name, Gender")
    """
    text = extract_text_from_file(file_path)
    
    if use_pdf_regex:
        # Use the PDF-specific regex pattern
        members = extract_members_from_pdf(text)
    else:
        # Parse line by line
        members = []
        lines = text.split('\n')
        for line in lines:
            parsed = parse_member_row(line)
            if parsed:
                members.append({
                    'name': parsed['name'],
                    'gender': parsed['gender'],
                    'category': 'REGULAR'
                })
    
    # Format output as list of strings with \n
    result = []
    for member in members:
        result.append(member['name'])
    
    return result


def main():
    """CLI entry point"""
    if len(sys.argv) < 2:
        print("Usage: python parse_members.py <file_path> [--line-by-line]")
        print("\nOptions:")
        print("  --line-by-line    Parse line by line instead of using PDF regex")
        print("\nExample:")
        print("  python parse_members.py members.pdf")
        print("  python parse_members.py members.txt --line-by-line")
        sys.exit(1)
    
    file_path = sys.argv[1]
    use_pdf_regex = '--line-by-line' not in sys.argv
    
    try:
        members = parse_members_file(file_path, use_pdf_regex=use_pdf_regex)
        
        print(f"Found {len(members)} members:\n")
        print('\n'.join(members))
        
        # Also save to output file
        output_file = 'parsed_members.txt'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(members))
        
        print(f"\n✓ Saved to {output_file}")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
