import os
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
from sqlalchemy.orm import Session
from app.models.invoice import Invoice as InvoiceModel
from app.models.customer import Customer as CustomerModel
from app.models.settings import Settings as SettingsModel

def generate_invoice_pdf(invoice_id: int, db: Session):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if not invoice:
        return None
    
    customer = db.query(CustomerModel).filter(CustomerModel.id == invoice.customer_id).first()
    settings = db.query(SettingsModel).first()
    
    if not settings:
        settings = SettingsModel()
    
    template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template("invoice.html")
    
    html_content = template.render(
        invoice=invoice,
        customer=customer,
        settings=settings,
        items=invoice.items
    )
    
    pdf_dir = "storage/pdfs"
    os.makedirs(pdf_dir, exist_ok=True)
    
    pdf_path = os.path.join(pdf_dir, f"invoice_{invoice.id}.pdf")
    
    # Convert HTML to PDF using xhtml2pdf
    with open(pdf_path, "wb") as pdf_file:
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)
    
    if pisa_status.err:
        return None
    
    invoice.pdf_path = pdf_path
    db.commit()
    
    return pdf_path
