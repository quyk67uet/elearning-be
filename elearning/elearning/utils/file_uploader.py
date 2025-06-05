# elearning/elearning/utils/file_uploader.py
import frappe
from frappe.utils.file_manager import save_file
from frappe import _
import logging

uploader_logger = frappe.logger("file_uploader_service")

@frappe.whitelist(methods=["POST"])
def upload_test_answer_image():
    uploader_logger.info(f"Attempting to upload a test answer image. User: {frappe.session.user}")
    user = frappe.session.user # Re-check user for security
    if user == "Guest":
        uploader_logger.warning("Guest user tried to upload essay image. Denied.")
        frappe.throw(_("Authentication required."), frappe.AuthenticationError)

    try:
        if not frappe.request.files:
            uploader_logger.error("No file found in request for essay image upload.")
            frappe.throw(_("No file attached."))

        uploaded_file_obj = frappe.request.files.get('file') # Frontend will send file with key 'file'
        if not uploaded_file_obj:
            uploader_logger.error("File object not found under 'file' key.")
            frappe.throw(_("File object not found in request under 'file' key."))

        file_name = uploaded_file_obj.filename
        content = uploaded_file_obj.stream.read()

        is_private = int(frappe.form_dict.get("is_private", 1))
        folder = frappe.form_dict.get("folder", "Home/Attachments/Test Answers") # Consider a more specific folder
        
        # Optionally, you can pass doctype and docname if the TestAttempt is already created
        # and you want to attach directly. For now, let's make it more generic.
        # doctype_attach = frappe.form_dict.get("doctype")
        # docname_attach = frappe.form_dict.get("docname")

        uploader_logger.info(f"Saving file: {file_name}, private: {is_private}, folder: {folder}")

        file_doc = save_file(
            fname=file_name,
            content=content,
            # dt=doctype_attach, # Not attaching to a specific doc during this initial upload
            # dn=docname_attach,  # This can be linked later
            folder=folder,
            is_private=is_private,
            decode=False
        )
        
        uploader_logger.info(f"File saved successfully: {file_doc.name}, URL: {file_doc.file_url}")
        # Return 'name' (File Doc ID) and 'file_url'
        return {
            "name": file_doc.name,
            "file_url": file_doc.file_url,
            "original_filename": file_name # Useful for display on frontend
        }

    except Exception as e:
        uploader_logger.error(f"Error uploading essay image: {e}", exc_info=True)
        frappe.throw(_("Failed to upload file. Error: {0}").format(str(e)))