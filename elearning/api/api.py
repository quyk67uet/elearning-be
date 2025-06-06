import frappe
from frappe import _

def handle_cors():
    """Thêm CORS headers vào response"""
    if not frappe.request or not frappe.response:
        return
        
    # Kiểm tra nguồn gốc request
    origin = frappe.request.headers.get("Origin", "")
    allowed_origins = frappe.conf.get("allow_cors", [])
    
    if isinstance(allowed_origins, str):
        allowed_origins = [allowed_origins]
    
    # Nếu origin nằm trong danh sách cho phép
    if origin in allowed_origins or "*" in allowed_origins:
        frappe.response.headers["Access-Control-Allow-Origin"] = origin
        frappe.response.headers["Access-Control-Allow-Credentials"] = "true"
        frappe.response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        frappe.response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, X-Frappe-CSRF-Token" 