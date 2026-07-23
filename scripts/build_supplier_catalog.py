#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SUPPLIERS_DIR = Path("/Users/Dawid/Desktop/Suppliers ")
OUTPUT_PATH = ROOT / "lib" / "ai-designer" / "supplier-catalog.generated.json"


SUPPLIER_IDS = {
    "Howdens": "howdens",
    "Wren": "wren",
    "Ikea": "ikea",
    "B&Q": "bq",
}


STYLE_TERMS = [
    "Shaker",
    "In-Frame",
    "Handleless",
    "J-Pull",
    "True Handleless",
    "Slab",
    "Gloss",
    "Matt",
    "Timber",
    "Classic",
    "Modern",
    "Contemporary",
    "Scandinavian",
    "Industrial",
    "Traditional",
]

COLOR_TERMS = [
    "White",
    "Super White",
    "Porcelain",
    "Ivory",
    "Cashmere",
    "Light Grey",
    "Grey",
    "Stone Grey",
    "Graphite",
    "Black",
    "Navy",
    "Blue",
    "Sage",
    "Green",
    "Oak",
    "Natural Oak",
    "Walnut",
    "Dove Grey",
    "Off-White",
]

HANDLE_TERMS = [
    "Handleless",
    "Knob",
    "Bar Handle",
    "Cup Handle",
    "Rail Handle",
    "T-Bar",
    "D Handle",
    "Integrated Handle",
    "J-Pull",
]

WORKTOP_TERMS = [
    "Laminate",
    "Compact Laminate",
    "Quartz",
    "Granite",
    "Solid Surface",
    "Solid Wood",
    "Timber",
    "Hi-Macs",
]

APPLIANCE_TERMS = [
    "Oven",
    "Hob",
    "Extractor",
    "Fridge",
    "Freezer",
    "Dishwasher",
    "Microwave",
    "Wine Cooler",
    "Warming Drawer",
]


@dataclass
class OptionEvidence:
    value: str
    references: list[dict[str, str | int]]


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def contains_term(text: str, term: str) -> bool:
    pattern = re.compile(rf"\b{re.escape(term.lower())}\b")
    return bool(pattern.search(text.lower()))


def extract_pdf_pages(pdf_path: Path) -> list[dict[str, str | int]]:
    pages: list[dict[str, str | int]] = []
    reader = PdfReader(str(pdf_path))
    for page_number, page in enumerate(reader.pages, start=1):
        raw = page.extract_text() or ""
        snippet = normalize_whitespace(raw)[:700]
        pages.append(
            {
                "page": page_number,
                "text": raw,
                "snippet": snippet,
            }
        )
    return pages


def collect_terms(
    pages_by_doc: dict[str, list[dict[str, str | int]]], terms: Iterable[str]
) -> list[dict[str, object]]:
    options: list[dict[str, object]] = []
    for term in terms:
        refs: list[dict[str, str | int]] = []
        for document_name, pages in pages_by_doc.items():
            for page_data in pages:
                text = str(page_data["text"])
                if contains_term(text, term):
                    refs.append(
                        {
                            "document": document_name,
                            "page": int(page_data["page"]),
                            "snippet": str(page_data["snippet"])[:240],
                        }
                    )
                    if len(refs) >= 8:
                        break
            if len(refs) >= 8:
                break
        if refs:
            options.append(
                {
                    "value": term,
                    "references": refs,
                }
            )
    return options


def build_catalog(suppliers_dir: Path) -> dict[str, object]:
    suppliers_payload: list[dict[str, object]] = []
    for folder_name, supplier_id in SUPPLIER_IDS.items():
        folder = suppliers_dir / folder_name
        if not folder.exists():
            continue

        pdf_files = sorted(folder.glob("*.pdf"))
        image_files = sorted(folder.glob("*.PNG")) + sorted(folder.glob("*.png"))
        pages_by_doc: dict[str, list[dict[str, str | int]]] = {}
        documents: list[dict[str, object]] = []

        for pdf_file in pdf_files:
            pages = extract_pdf_pages(pdf_file)
            pages_by_doc[pdf_file.name] = pages
            documents.append(
                {
                    "name": pdf_file.name,
                    "type": "pdf",
                    "pages": len(pages),
                }
            )

        if image_files:
            documents.append(
                {
                    "name": "Wren image set",
                    "type": "image-sequence",
                    "pages": len(image_files),
                    "samples": [item.name for item in image_files[:18]],
                }
            )

        supplier_payload = {
            "id": supplier_id,
            "label": folder_name,
            "sourceFolder": str(folder),
            "documents": documents,
            "styles": collect_terms(pages_by_doc, STYLE_TERMS),
            "colors": collect_terms(pages_by_doc, COLOR_TERMS),
            "handles": collect_terms(pages_by_doc, HANDLE_TERMS),
            "worktops": collect_terms(pages_by_doc, WORKTOP_TERMS),
            "appliances": collect_terms(pages_by_doc, APPLIANCE_TERMS),
        }
        suppliers_payload.append(supplier_payload)

    return {"suppliers": suppliers_payload}


def main() -> None:
    parser = argparse.ArgumentParser(description="Build supplier brochure-based option catalog")
    parser.add_argument("--suppliers-dir", default=str(DEFAULT_SUPPLIERS_DIR))
    parser.add_argument("--output", default=str(OUTPUT_PATH))
    args = parser.parse_args()

    suppliers_dir = Path(args.suppliers_dir)
    output_path = Path(args.output)

    payload = build_catalog(suppliers_dir)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    print(f"Catalog generated: {output_path}")


if __name__ == "__main__":
    main()
