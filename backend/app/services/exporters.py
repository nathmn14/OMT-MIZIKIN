from __future__ import annotations

from datetime import datetime
from io import BytesIO
from urllib.parse import quote

from fastapi import HTTPException
from fastapi.responses import StreamingResponse


def _slugify(value: str) -> str:
    cleaned = "".join(c if c.isalnum() else "-" for c in value.strip().lower())
    compact = "-".join(part for part in cleaned.split("-") if part)
    return compact or "export"


def _build_export_rows(tickets: list, category_lookup: dict[int, str]) -> list[list[str]]:
    rows: list[list[str]] = []
    for ticket in tickets:
        price_paid = ticket.price_paid if ticket.price_paid is not None else ticket.price
        rows.append([
            str(ticket.id),
            ticket.participant_name or "",
            ticket.participant_email or "",
            category_lookup.get(ticket.category_id, ticket.type or ""),
            ticket.type or "",
            str(ticket.price),
            ticket.payment_currency or "$",
            str(price_paid),
            ticket.status,
            ticket.qr_code_data,
            ticket.created_at.strftime("%Y-%m-%d %H:%M") if ticket.created_at else "",
        ])
    return rows


def _build_filename(event_title: str, suffix: str, ext: str) -> str:
    return f"{_slugify(event_title)}-{suffix}-{datetime.utcnow():%Y%m%d-%H%M%S}.{ext}"


def _ticket_status_value(ticket) -> str:
    return str(ticket.status or "")


def _is_checked_in_status(ticket) -> bool:
    normalized = _ticket_status_value(ticket).strip().lower()
    return normalized in {"used", "utilise", "utilisé", "checked_in"}


def build_event_excel_response(event, tickets: list):
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail="Le package openpyxl est requis pour exporter en Excel."
        ) from exc
    category_lookup = {category.id: category.name for category in getattr(event, "categories", [])}
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Export"
    sheet.sheet_view.showGridLines = False
    sheet.page_setup.orientation = "portrait"
    sheet.page_setup.fitToWidth = 1
    sheet.page_setup.fitToHeight = 0
    sheet.page_margins.left = 0.35
    sheet.page_margins.right = 0.35
    sheet.page_margins.top = 0.5
    sheet.page_margins.bottom = 0.5
    sheet.print_options.horizontalCentered = True
    sheet.sheet_properties.pageSetUpPr.fitToPage = True

    sold_count = len(tickets)
    checked_in = sum(1 for ticket in tickets if _is_checked_in_status(ticket))
    total_revenue = sum(
        ticket.price_paid if ticket.price_paid is not None else ticket.price
        for ticket in tickets
    )

    coral_fill = PatternFill(fill_type="solid", fgColor="F26645")
    deep_fill = PatternFill(fill_type="solid", fgColor="10202B")
    cream_fill = PatternFill(fill_type="solid", fgColor="FFF4D6")
    light_fill = PatternFill(fill_type="solid", fgColor="FFFDF7")
    gold_fill = PatternFill(fill_type="solid", fgColor="F3C64E")
    soft_gold_fill = PatternFill(fill_type="solid", fgColor="F8E7B4")
    white_font = Font(color="FFFFFF", bold=True, size=13)
    title_font = Font(color="FFFFFF", bold=True, size=16)
    subtitle_font = Font(color="FFF4D6", bold=True, size=10)
    label_font = Font(color="7C5A2B", bold=True, size=9)
    value_font = Font(color="0F172A", bold=False, size=10)
    border = Border(
        left=Side(style="thin", color="E6B85C"),
        right=Side(style="thin", color="E6B85C"),
        top=Side(style="thin", color="E6B85C"),
        bottom=Side(style="thin", color="E6B85C"),
    )

    sheet.merge_cells("A1:H2")
    title_cell = sheet["A1"]
    title_cell.value = f"MIZIKIN EXPORT | {event.title}"
    title_cell.fill = coral_fill
    title_cell.font = title_font
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    for row in range(1, 3):
        for col in range(1, 9):
            sheet.cell(row=row, column=col).fill = coral_fill
            sheet.cell(row=row, column=col).border = border

    sheet.merge_cells("A3:H3")
    subtitle_cell = sheet["A3"]
    subtitle_cell.value = "Music & Art Urban Festival | Export participants | Controle & reporting"
    subtitle_cell.fill = deep_fill
    subtitle_cell.font = subtitle_font
    subtitle_cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    subtitle_cell.border = border
    for col in range(1, 9):
        sheet.cell(row=3, column=col).fill = deep_fill
        sheet.cell(row=3, column=col).border = border

    intro_rows = [
        ("DATE", f"{event.date} {event.time or ''}".strip()),
        ("LIEU", event.location),
        ("BILLETS VENDUS", str(sold_count)),
        ("PARTICIPANTS PRESENTS", str(checked_in)),
        ("REVENU TOTAL", f"{total_revenue} {event.currency}"),
    ]
    current_row = 5
    for label, value in intro_rows:
        sheet.cell(row=current_row, column=1, value=label)
        sheet.cell(row=current_row, column=1).fill = gold_fill
        sheet.cell(row=current_row, column=1).font = label_font
        sheet.cell(row=current_row, column=1).alignment = Alignment(horizontal="center", vertical="center")
        sheet.cell(row=current_row, column=1).border = border

        sheet.merge_cells(start_row=current_row, start_column=2, end_row=current_row, end_column=8)
        value_cell = sheet.cell(row=current_row, column=2)
        value_cell.value = value
        summary_fill = soft_gold_fill if current_row % 2 == 1 else cream_fill
        value_cell.fill = summary_fill
        value_cell.font = value_font
        value_cell.alignment = Alignment(horizontal="left", vertical="center")
        value_cell.border = border
        for col in range(2, 9):
            sheet.cell(row=current_row, column=col).fill = summary_fill
            sheet.cell(row=current_row, column=col).border = border
        current_row += 1

    headers = [
        "ID",
        "Participant",
        "Email",
        "Categorie",
        "Type",
        "Montant",
        "Statut",
        "Reference",
    ]

    table_row = current_row + 1
    for col_index, header in enumerate(headers, start=1):
        cell = sheet.cell(row=table_row, column=col_index, value=header)
        cell.fill = coral_fill if col_index <= 6 else deep_fill
        cell.font = white_font
        cell.border = border
        cell.alignment = Alignment(horizontal="center", vertical="center")

    for row_offset, ticket in enumerate(tickets, start=1):
        amount_value = f"{ticket.price_paid if ticket.price_paid is not None else ticket.price} {ticket.payment_currency or '$'}"
        row_values = [
            str(ticket.id),
            ticket.participant_name or "",
            ticket.participant_email or "",
            category_lookup.get(ticket.category_id, ticket.type or ""),
            ticket.type or "",
            amount_value,
            _ticket_status_value(ticket),
            ticket.qr_code_data,
        ]
        for col_index, value in enumerate(row_values, start=1):
            cell = sheet.cell(row=table_row + row_offset, column=col_index, value=value)
            cell.border = border
            cell.fill = light_fill if row_offset % 2 == 1 else cream_fill
            cell.alignment = Alignment(vertical="top", horizontal="left", wrap_text=True)

    widths = {
        "A": 6,
        "B": 18,
        "C": 22,
        "D": 14,
        "E": 10,
        "F": 12,
        "G": 12,
        "H": 18,
    }
    for col, width in widths.items():
        sheet.column_dimensions[col].width = width

    for row_index in range(1, table_row + len(tickets) + 1):
        sheet.row_dimensions[row_index].height = 22
    for row_index in range(1, 4):
        sheet.row_dimensions[row_index].height = 26

    sheet.freeze_panes = f"A{table_row + 1}"

    buffer = BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    filename = _build_filename(event.title, "participants", "xlsx")
    encoded = quote(filename)
    headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{encoded}"}
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


def build_event_pdf_response(event, tickets: list):
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.lib.units import cm
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail="Le package reportlab est requis pour exporter en PDF."
        ) from exc

    category_lookup = {category.id: category.name for category in getattr(event, "categories", [])}
    sold_count = len(tickets)
    checked_in = sum(1 for ticket in tickets if _is_checked_in_status(ticket))
    total_revenue = sum(
        ticket.price_paid if ticket.price_paid is not None else ticket.price
        for ticket in tickets
    )
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.2 * cm,
        leftMargin=1.2 * cm,
        topMargin=1.2 * cm,
        bottomMargin=1.2 * cm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "MizikinTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.white,
        alignment=0,
        spaceAfter=0,
    )
    subtitle_style = ParagraphStyle(
        "MizikinSubtitle",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#F8E7B4"),
        alignment=0,
        tracking=1.2,
    )
    banner_meta_style = ParagraphStyle(
        "BannerMeta",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#FFF4D6"),
        alignment=0,
    )
    summary_label_style = ParagraphStyle(
        "SummaryLabel",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#8A5A1D"),
        alignment=0,
    )
    summary_value_style = ParagraphStyle(
        "SummaryValue",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#1F2937"),
        alignment=0,
    )
    info_style = ParagraphStyle(
        "MizikinInfo",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#334155"),
    )

    title_block = Table([
        [Paragraph("MIZIKIN EXPORT", subtitle_style)],
        [Paragraph(f"Participants de l'evenement: {event.title}", title_style)],
        [Paragraph(
            f"Music & Art Urban Festival | {event.date} {event.time or ''} | {event.location}",
            banner_meta_style,
        )],
    ], colWidths=[document.width])
    title_block.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F26645")),
        ("LINEBELOW", (0, 0), (-1, 0), 1, colors.HexColor("#F8E7B4")),
        ("BOX", (0, 0), (-1, -1), 0, colors.white),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
    ]))
    summary_data = [
        [
            Paragraph("<b>DATE</b><br/>" + f"{event.date} {event.time or ''}".strip(), summary_label_style),
            Paragraph("<b>LIEU</b><br/>" + f"{event.location}", summary_label_style),
        ],
        [
            Paragraph("<b>BILLETS VENDUS</b><br/>" + f"{sold_count}", summary_value_style),
            Paragraph("<b>PARTICIPANTS PRESENTS</b><br/>" + f"{checked_in}", summary_value_style),
        ],
        [
            Paragraph("<b>REVENUS</b><br/>" + f"{total_revenue} {event.currency}", summary_value_style),
            Paragraph("<b>FORMAT</b><br/>PDF + Excel premium", summary_label_style),
        ],
    ]
    summary = Table(summary_data, colWidths=[document.width / 2.0] * 2)
    summary.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF4D6")),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#F3C64E")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#F8D983")),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    ticket_strip = Table([
        [
            Paragraph(
                "PASS MIZIKIN<br/><b>Controle terrain</b><br/>Music & Art Urban Festival",
                ParagraphStyle(
                    "TicketStripBrand",
                    parent=styles["BodyText"],
                    fontName="Helvetica-Bold",
                    fontSize=8,
                    leading=10,
                    textColor=colors.HexColor("#F8E7B4"),
                ),
            ),
            Paragraph(
                f"<b>{event.title}</b><br/>"
                f"{checked_in}/{sold_count} presents controles<br/>"
                f"Reference export: {_slugify(event.title).upper()}",
                ParagraphStyle(
                    "TicketStripBody",
                    parent=styles["BodyText"],
                    fontName="Helvetica-Bold",
                    fontSize=10,
                    leading=13,
                    textColor=colors.HexColor("#FFF7E8"),
                ),
            ),
            Paragraph(
                f"<b>{total_revenue} {event.currency}</b><br/>"
                f"Billets: {sold_count}<br/>"
                f"Type: Premium export",
                ParagraphStyle(
                    "TicketStripStub",
                    parent=styles["BodyText"],
                    fontName="Helvetica-Bold",
                    fontSize=9,
                    leading=12,
                    textColor=colors.HexColor("#7C2D12"),
                    alignment=1,
                ),
            ),
        ]
    ], colWidths=[4.0 * cm, 9.2 * cm, 3.9 * cm])
    ticket_strip.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (1, 0), colors.HexColor("#10202B")),
        ("BACKGROUND", (2, 0), (2, 0), colors.HexColor("#F3C64E")),
        ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#F3C64E")),
        ("LINEAFTER", (0, 0), (0, 0), 0.8, colors.HexColor("#F26645")),
        ("LINEAFTER", (1, 0), (1, 0), 0.8, colors.HexColor("#F8D983")),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))

    elements = [
        title_block,
        Spacer(1, 0.35 * cm),
        summary,
        Spacer(1, 0.28 * cm),
        ticket_strip,
        Spacer(1, 0.45 * cm),
        Paragraph(
            "Liste des participants et references de billets. Ce document reprend une presentation inspiree du ticket MIZIKIN pour un partage, un controle terrain ou un archivage plus lisible.",
            info_style,
        ),
        Spacer(1, 0.3 * cm),
    ]

    table_data = [[
        "ID",
        "Participant",
        "Email",
        "Categorie",
        "Type",
        "Montant",
        "Statut",
        "Reference",
    ]]
    for ticket in tickets:
        table_data.append([
            str(ticket.id),
            ticket.participant_name or "",
            ticket.participant_email or "",
            category_lookup.get(ticket.category_id, ticket.type or ""),
            ticket.type or "",
            f"{ticket.price_paid if ticket.price_paid is not None else ticket.price} {ticket.payment_currency or '$'}",
            _ticket_status_value(ticket),
            ticket.qr_code_data,
        ])

    table = Table(
        table_data,
        colWidths=[1.2 * cm, 3.0 * cm, 4.1 * cm, 2.4 * cm, 2.0 * cm, 2.2 * cm, 2.0 * cm, 3.0 * cm],
        repeatRows=1,
    )
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F26645")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#FFF7E8")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#E6B85C")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFDF7"), colors.HexColor("#FFF4D6")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.35 * cm))
    elements.append(
        Paragraph(
            "Document genere automatiquement par MIZIKIN. Utilisez les references pour vos controles sur site.",
            ParagraphStyle(
                "FooterNote",
                parent=styles["BodyText"],
                fontName="Helvetica-Oblique",
                fontSize=8,
                leading=10,
                textColor=colors.HexColor("#7C5A2B"),
                alignment=1,
            ),
        )
    )

    document.build(elements)
    buffer.seek(0)

    filename = _build_filename(event.title, "participants", "pdf")
    encoded = quote(filename)
    headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{encoded}"}
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers=headers,
    )


def build_event_export_response(event, tickets: list, export_format: str):
    normalized = export_format.lower()
    if normalized == "xlsx":
        return build_event_excel_response(event, tickets)
    if normalized == "pdf":
        return build_event_pdf_response(event, tickets)
    raise HTTPException(status_code=400, detail="Format d'export non supporte. Utilisez pdf ou xlsx.")
