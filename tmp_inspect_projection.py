from pathlib import Path
import json
import re
import zipfile
import xml.etree.ElementTree as ET


NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "docrel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def col_to_index(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref)
    letters = match.group(1)
    result = 0
    for char in letters:
        result = result * 26 + (ord(char) - ord("A") + 1)
    return result


workbook_path = Path(
    r"c:\Users\asmal\Desktop\UA3 - Chiffrier - Projet Final\05_livrable_final\Projection_financiere_SahelAI.xlsx"
)

# fallback exact provided name if typo above
if not workbook_path.exists():
    workbook_path = Path(
        r"c:\Users\asmal\Desktop\UA3 - Chiffrier - Projet Final\05_livrable_final\Projection_financiere_SahelStockAI.xlsx"
    )

report = {"sheets": []}

with zipfile.ZipFile(workbook_path) as zf:
    shared_strings = []
    if "xl/sharedStrings.xml" in zf.namelist():
      shared_root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
      for si in shared_root.findall("main:si", NS):
          texts = [t.text or "" for t in si.findall(".//main:t", NS)]
          shared_strings.append("".join(texts))

    workbook_root = ET.fromstring(zf.read("xl/workbook.xml"))
    workbook_rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rel_map = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in workbook_rels.findall("rel:Relationship", NS)
    }

    sheets = workbook_root.find("main:sheets", NS)

    for sheet in sheets.findall("main:sheet", NS):
        sheet_name = sheet.attrib["name"]
        rel_id = sheet.attrib[
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        ]
        target = rel_map[rel_id]
        sheet_path = target.lstrip("/")
        if not sheet_path.startswith("xl/"):
            sheet_path = "xl/" + sheet_path
        root = ET.fromstring(zf.read(sheet_path))

        dimension = root.find("main:dimension", NS)
        dimension_ref = dimension.attrib.get("ref", "") if dimension is not None else ""
        sheet_data = root.find("main:sheetData", NS)

        max_row = 0
        max_col = 0
        preview_rows = {}
        formulas = []

        for row in sheet_data.findall("main:row", NS):
            row_idx = int(row.attrib["r"])
            max_row = max(max_row, row_idx)
            if row_idx <= 20:
                preview_rows[row_idx] = {}

            for cell in row.findall("main:c", NS):
                ref = cell.attrib["r"]
                col_idx = col_to_index(ref)
                max_col = max(max_col, col_idx)
                cell_type = cell.attrib.get("t")
                formula = cell.find("main:f", NS)
                value_node = cell.find("main:v", NS)
                inline = cell.find("main:is/main:t", NS)

                value = None
                if inline is not None:
                    value = inline.text or ""
                elif value_node is not None:
                    raw = value_node.text
                    if cell_type == "s" and raw is not None:
                        value = shared_strings[int(raw)]
                    else:
                        value = raw

                if formula is not None and len(formulas) < 60:
                    formulas.append({"cell": ref, "formula": "=" + (formula.text or "")})

                if row_idx <= 20 and col_idx <= 12:
                    preview_rows[row_idx][col_idx] = value

        preview = []
        for row_idx in range(1, min(max_row, 20) + 1):
            row_values = []
            row_map = preview_rows.get(row_idx, {})
            for col_idx in range(1, min(max_col, 12) + 1):
                row_values.append(row_map.get(col_idx))
            preview.append(row_values)

        report["sheets"].append(
            {
                "title": sheet_name,
                "dimension": dimension_ref,
                "max_row": max_row,
                "max_col": max_col,
                "preview": preview,
                "formulas": formulas,
            }
        )

print(json.dumps(report, ensure_ascii=False, indent=2))
