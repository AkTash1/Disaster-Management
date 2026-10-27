import re
import os
import zipfile
import xml.etree.ElementTree as ET

files = [
    'data/pdf_extracted_texts/DB_Tables.txt',
    'data/pdf_extracted_texts/Ideas_for_dashboard.txt',
    'data/pdf_extracted_texts/Data-Engineering-Tasks_V1.txt',
    'data/pdf_extracted_texts/Detailed-Technical-Details.txt'
]

for fname in files:
    if os.path.exists(fname):
        with open(fname, 'r', encoding='utf-8') as f:
            text = f.read()
        urls = re.findall(r'https?://[^\s)\]\"\'<>]+', text)
        print(f"=== URLs in {fname} ===")
        for u in set(urls):
            print("  ", u)

# Also check hyperlinks in DB_Tables.docx and Ideas for dashboard.docx directly from Word XML (hyperlinks are often in word/_rels/document.xml.rels)
for docx_name in ['DB_Tables.docx', 'Ideas for dashboard.docx']:
    if os.path.exists(docx_name):
        print(f"=== Hyperlinks in {docx_name} ===")
        with zipfile.ZipFile(docx_name) as z:
            if 'word/_rels/document.xml.rels' in z.namelist():
                tree = ET.fromstring(z.read('word/_rels/document.xml.rels'))
                for node in tree:
                    if 'Target' in node.attrib:
                        target = node.attrib['Target']
                        if target.startswith('http'):
                            print("  ", node.attrib.get('Id'), "->", target)
