#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import mimetypes
import re
import tempfile
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

from pypdf import PdfReader, PdfWriter


DEFAULT_SUPPLIERS_DIR = Path("/Users/Dawid/Desktop/Suppliers ")
DEFAULT_ENV_FILE = Path(".env.local")
DEFAULT_CATALOG_FILE = Path("lib/ai-designer/supplier-catalog.generated.json")
BUCKET = "ai-designer"
ASSETS_PREFIX = "supplier-brochures-assets"
PAGES_PREFIX = "supplier-brochures-pages"
SUPPLIERS = {"Howdens": "howdens", "Wren": "wren", "Ikea": "ikea", "B&Q": "bq"}
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".avif"}


def load_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key] = value
    return values


def sanitize_storage_file_name(file_name: str) -> str:
    dot_index = file_name.rfind(".")
    has_extension = dot_index > 0
    base = file_name[:dot_index] if has_extension else file_name
    extension = file_name[dot_index:].lower() if has_extension else ""
    safe_base = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower()
    if not safe_base:
        safe_base = "source"
    safe_base = re.sub(r"-{2,}", "-", safe_base)
    return f"{safe_base}{extension}"


def asset_storage_key(supplier_id: str, file_name: str) -> str:
    return f"{ASSETS_PREFIX}/{supplier_id}/{sanitize_storage_file_name(file_name)}"


def page_storage_key(supplier_id: str, document_name: str, page_number: int) -> str:
    return (
        f"{PAGES_PREFIX}/{supplier_id}/{sanitize_storage_file_name(document_name)}"
        f"/page-{page_number:04d}.pdf"
    )


def upload_file(
    base_url: str, service_key: str, source_file: Path, object_key: str, content_type: str
) -> None:
    encoded_key = "/".join(quote(segment, safe="") for segment in object_key.split("/"))
    url = f"{base_url}/storage/v1/object/{BUCKET}/{encoded_key}"
    data = source_file.read_bytes()

    request = Request(
        url,
        data=data,
        method="POST",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "x-upsert": "true",
            "Content-Type": content_type or "application/octet-stream",
        },
    )
    with urlopen(request, timeout=1800) as response:
        if response.status not in (200, 201):
            raise RuntimeError(f"Upload failed for {source_file.name} (status {response.status})")


def extract_single_pdf_page(source_pdf: Path, page_number: int) -> bytes:
    reader = PdfReader(str(source_pdf))
    if page_number < 1 or page_number > len(reader.pages):
        raise ValueError(f"Page {page_number} is out of range for {source_pdf.name}")
    writer = PdfWriter()
    writer.add_page(reader.pages[page_number - 1])
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as temp:
        writer.write(temp)
        temp.flush()
        return Path(temp.name).read_bytes()


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload supplier brochure assets to Supabase storage")
    parser.add_argument("--suppliers-dir", default=str(DEFAULT_SUPPLIERS_DIR))
    parser.add_argument("--env-file", default=str(DEFAULT_ENV_FILE))
    parser.add_argument("--catalog-file", default=str(DEFAULT_CATALOG_FILE))
    args = parser.parse_args()

    suppliers_dir = Path(args.suppliers_dir)
    env = load_env(Path(args.env_file))
    catalog_payload = json.loads(Path(args.catalog_file).read_text(encoding="utf-8"))
    suppliers_catalog = (
        catalog_payload["suppliers"]
        if isinstance(catalog_payload, dict) and "suppliers" in catalog_payload
        else catalog_payload
    )
    base_url = env["SUPABASE_URL"].rstrip("/")
    service_key = env["SUPABASE_SERVICE_ROLE_KEY"]

    upload_assets: list[tuple[Path, str, str]] = []
    for folder_name, supplier_id in SUPPLIERS.items():
        folder = suppliers_dir / folder_name
        if not folder.exists():
            continue
        for file_path in sorted(folder.iterdir()):
            if not file_path.is_file():
                continue
            if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
                continue
            if file_path.suffix.lower() == ".pdf":
                continue
            ctype = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
            upload_assets.append((file_path, asset_storage_key(supplier_id, file_path.name), ctype))

    print(f"Uploading {len(upload_assets)} asset files to {BUCKET}/{ASSETS_PREFIX} ...")
    for index, (file_path, key, ctype) in enumerate(upload_assets, start=1):
        print(f"[asset {index}/{len(upload_assets)}] {file_path.name}")
        upload_file(base_url, service_key, file_path, key, ctype)

    pages_by_source: dict[tuple[str, str], set[int]] = {}
    for supplier in suppliers_catalog:
        sid = supplier["id"]
        for group_name in ("styles", "colors", "handles", "worktops", "appliances"):
            for option in supplier.get(group_name, []):
                for ref in option.get("references", []):
                    document = ref.get("document")
                    page = ref.get("page")
                    if (
                        isinstance(document, str)
                        and document.lower().endswith(".pdf")
                        and isinstance(page, int)
                        and page > 0
                    ):
                        pages_by_source.setdefault((sid, document), set()).add(page)
        for document in supplier.get("documents", []):
            if document.get("type") == "pdf" and isinstance(document.get("name"), str):
                pages_by_source.setdefault((sid, document["name"]), set()).add(1)

    upload_pages: list[tuple[str, str, int]] = []
    for (sid, document), pages in sorted(pages_by_source.items()):
        for page in sorted(pages):
            upload_pages.append((sid, document, page))

    print(f"Uploading {len(upload_pages)} PDF reference pages to {BUCKET}/{PAGES_PREFIX} ...")
    supplier_folder_by_id = {v: k for k, v in SUPPLIERS.items()}
    for index, (sid, document, page) in enumerate(upload_pages, start=1):
        source_pdf = suppliers_dir / supplier_folder_by_id[sid] / document
        if not source_pdf.exists():
            print(f"[page {index}/{len(upload_pages)}] skip missing source: {source_pdf}")
            continue
        print(f"[page {index}/{len(upload_pages)}] {document} p{page}")
        payload = extract_single_pdf_page(source_pdf, page)
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as temp_file:
            temp_path = Path(temp_file.name)
            temp_path.write_bytes(payload)
            upload_file(
                base_url,
                service_key,
                temp_path,
                page_storage_key(sid, document, page),
                "application/pdf",
            )

    print("Upload finished.")


if __name__ == "__main__":
    main()
