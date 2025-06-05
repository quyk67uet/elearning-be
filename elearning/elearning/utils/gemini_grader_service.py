# elearning/elearning/utils/gemini_grader_service.py
import frappe
import requests
import json
import os
import base64
import logging

logger = frappe.logger("gemini_essay_grader") # Giữ nguyên logger name từ code bạn cung cấp

def grade_essay_with_gemini(question_doc_content, question_name_for_log, rubric_items, file_doc_names, student_answer_text=None):
    GEMINI_API_KEY = frappe.conf.get("gemini_api_key") or os.environ.get("GEMINI_API_KEY")

    if not GEMINI_API_KEY:
        logger.error(f"Gemini API key not found for grading essay question {question_name_for_log}.")
        return {
            "total_score_awarded": 0,
            "overall_feedback": "Lỗi cấu hình: Không tìm thấy API key cho dịch vụ chấm điểm.",
            "rubric_scores": [],
            "error": True
        }

    prompt_parts_text = [
        f"Bạn là một trợ lý chấm điểm AI chuyên nghiệp cho các bài thi học thuật. Hãy chấm điểm câu trả lời cho câu hỏi tự luận sau đây một cách cẩn thận dựa trên thang điểm (rubric) được cung cấp. Nếu học sinh trả lời hoặc trình bày thừa, hoặc viết lại một bước nào đó mà không ảnh hưởng đến bài toán, thì không trừ điểm.",
        f"Câu hỏi: {question_doc_content}",
    ]

    has_text_answer = student_answer_text and student_answer_text.strip()
    if has_text_answer:
        prompt_parts_text.append(f"Phần bài làm dạng văn bản của học sinh:\n---\n{student_answer_text}\n---")
    else:
        prompt_parts_text.append("Học sinh không nộp phần bài làm dạng văn bản.")

    prompt_parts_text.append("\nThang điểm chi tiết (Rubric) để chấm điểm:")
    if rubric_items:
        for item in rubric_items:
            prompt_parts_text.append(f"- ID Tiêu chí: {item.get('id')}\n  Mô tả: {item.get('description')}\n  Điểm tối đa cho tiêu chí này: {item.get('max_score')} điểm.")
    else:
        prompt_parts_text.append("Không có thang điểm (rubric) nào được cung cấp cho câu hỏi này. Hãy nhận xét chung nếu có thể dựa trên nội dung bài làm.")

    image_data_parts_for_gemini = []
    has_valid_image_content = False

    if file_doc_names:
        prompt_parts_text.append("\nBài làm của học sinh (Dưới dạng hình ảnh đính kèm):")
        for i, file_doc_id in enumerate(file_doc_names):
            print(f"  Processing File Doc ID: {file_doc_id} for Q: {question_name_for_log}")
            try:
                file_doc = frappe.get_doc("File", file_doc_id)
                print(f"    Successfully fetched File Doc: {file_doc.name}, Original Filename: {file_doc.file_name}, File Type: {file_doc.file_type}")
                
                file_content_bytes = file_doc.get_content()
                if not file_content_bytes:
                    logger.warning(f"    Content for File Doc ID {file_doc_id} ('{file_doc.file_name}') is EMPTY. Skipping.")
                    prompt_parts_text.append(f"  (Lưu ý: File đính kèm {i+1} - '{file_doc.file_name}' - không có nội dung.)")
                    continue
                print(f"      File content length: {len(file_content_bytes)} bytes for '{file_doc.file_name}'")

                base64_encoded_data = base64.b64encode(file_content_bytes).decode('utf-8')
                
                raw_file_type = file_doc.file_type
                mime_type = None

                if raw_file_type:
                    raw_file_type_lower = raw_file_type.lower()
                    if raw_file_type_lower == 'jpg' or raw_file_type_lower == 'jpeg':
                        mime_type = 'image/jpeg'
                    elif raw_file_type_lower == 'png':
                        mime_type = 'image/png'
                    elif raw_file_type_lower == 'gif':
                        mime_type = 'image/gif'
                    elif raw_file_type_lower.startswith("image/"): # Nếu đã là dạng chuẩn
                        mime_type = raw_file_type_lower
                    else:
                        # Thử suy đoán từ đuôi file nếu file_type không nhận diện được
                        file_extension = os.path.splitext(file_doc.file_name)[-1].lower()
                        print(f"      Raw file_type '{raw_file_type}' not standard image. Trying extension '{file_extension}'.")
                        if file_extension == ".jpg" or file_extension == ".jpeg":
                            mime_type = "image/jpeg"
                        elif file_extension == ".png":
                            mime_type = "image/png"
                        elif file_extension == ".gif":
                            mime_type = "image/gif"
                else: # Nếu file_type rỗng, thử suy đoán hoàn toàn từ tên file
                    file_extension = os.path.splitext(file_doc.file_name)[-1].lower()
                    print(f"      Raw file_type is empty. Trying extension '{file_extension}'.")
                    if file_extension == ".jpg" or file_extension == ".jpeg":
                        mime_type = "image/jpeg"
                    elif file_extension == ".png":
                        mime_type = "image/png"
                    elif file_extension == ".gif":
                        mime_type = "image/gif"


                print(f"      Determined MIME Type: '{mime_type}' for '{file_doc.file_name}' (Original file_type: '{raw_file_type}')")

                if not mime_type or not mime_type.startswith("image/"):
                    logger.warning(f"      File {file_doc.name} ('{file_doc.file_name}') is STILL not a recognized image type (Determined MIME: '{mime_type}'). Skipping.")
                    prompt_parts_text.append(f"  (Lưu ý: File đính kèm {i+1} - '{file_doc.file_name}' - không phải là hình ảnh hợp lệ và đã được bỏ qua.)")
                    continue
                
                print(f"      Image '{file_doc.file_name}' (MIME: {mime_type}) IS VALID for AI. Adding to parts.")
                image_data_parts_for_gemini.append({
                    "inline_data": {
                        "mime_type": mime_type, 
                        "data": base64_encoded_data
                    }
                })
                prompt_parts_text.append(f"  (Hình ảnh {i+1} - '{file_doc.file_name}' - đã được đính kèm để AI xem xét.)")
                has_valid_image_content = True
            except frappe.DoesNotExistError:
                logger.error(f"    File Doc with ID '{file_doc_id}' not found for Q {question_name_for_log}.")
                prompt_parts_text.append(f"  (Lỗi: Không tìm thấy file đính kèm {i+1} - ID: {file_doc_id} trên server.)")
            except Exception as e_img_proc:
                logger.error(f"    Could not read/process image file (File Doc ID: {file_doc_id}) for Q {question_name_for_log}: {e_img_proc}", exc_info=True)
                prompt_parts_text.append(f"  (Lỗi khi xử lý Hình ảnh {i+1} - ID: {file_doc_id}. AI không thể xem xét hình ảnh này.)")
    else:
        prompt_parts_text.append("\nHọc sinh KHÔNG nộp bài làm dạng hình ảnh (không có file ID nào được cung cấp).")

    print(f"  INTERNAL has_text_answer: {has_text_answer}")
    print(f"  INTERNAL has_valid_image_content after loop: {has_valid_image_content}")

    if not has_text_answer and not has_valid_image_content:
         logger.warning(f"  FINAL CHECK: No text answer AND no valid image content processed for essay {question_name_for_log}. Returning 'No content' feedback.")
         return {
            "total_score_awarded": 0,
            "overall_feedback": "Không có nội dung bài làm được nộp (cả văn bản và hình ảnh).",
            "rubric_scores": [],
            "error": False 
        }

    prompt_parts_text.append("\nYêu cầu cụ thể cho AI:")
    prompt_parts_text.append("1. Phân tích kỹ lưỡng nội dung bài làm của học sinh (cả phần văn bản và hình ảnh nếu có).")
    prompt_parts_text.append("2. Đối chiếu với TỪNG TIÊU CHÍ trong thang điểm đã cung cấp.")
    prompt_parts_text.append("3. Cho điểm cụ thể cho mỗi tiêu chí (từ 0 đến điểm tối đa của tiêu chí đó). Điểm phải là số. Nếu chỉ đưa đáp án mà không có lời giải thích thì không cho điểm.")
    prompt_parts_text.append("4. Viết nhận xét ngắn gọn, giải thích lý do cho điểm số của từng tiêu chí.")
    prompt_parts_text.append("5. Tính tổng điểm đạt được của học sinh cho câu hỏi này.")
    prompt_parts_text.append("6. Viết một nhận xét tổng quan, mang tính xây dựng về toàn bộ bài làm của học sinh cho câu hỏi này.")
    prompt_parts_text.append("\nĐỊNH DẠNG TRẢ VỀ (QUAN TRỌNG):")
    prompt_parts_text.append("Hãy trả lời bằng một đối tượng JSON duy nhất, không có ký tự ```json hoặc markdown nào bao quanh. JSON phải có cấu trúc chính xác như sau (sử dụng tiếng Việt có dấu):")
    prompt_parts_text.append("""
{
  "total_score_awarded": 0.0,
  "overall_feedback": "string",
  "rubric_scores": [
    {
      "rubric_item_id": "string",
      "description": "string",
      "max_score": 0.0,
      "points_awarded": 0.0,
      "comment": "string"
    }
  ]
}
""")

    gemini_request_parts = [{"text": "\n".join(prompt_parts_text)}]
    if has_valid_image_content:
        gemini_request_parts.extend(image_data_parts_for_gemini)
    elif file_doc_names: 
        logger.warning(f"  No valid image data was prepared for Gemini, though file_doc_names were provided: {file_doc_names}. Only text (if any) will effectively be sent in prompt content.")

    payload = {
        "contents": [{"parts": gemini_request_parts}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.3,
            "max_output_tokens": 8192,
        },
         "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
        ]
    }
    
    payload_summary_for_log = {
        "contents_summary": f"{len(gemini_request_parts)} parts, images included: {has_valid_image_content}",
        "generationConfig": payload["generationConfig"],"safetySettings": payload["safetySettings"]
    }
    logger.debug(f"Gemini Payload Summary for Q {question_name_for_log}: {json.dumps(payload_summary_for_log, indent=2)}")
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"


    default_error_response = {
        "total_score_awarded": 0,
        "overall_feedback": "Lỗi không xác định trong quá trình chấm điểm AI.",
        "rubric_scores": [],
        "error": True
    }

    try:
        print(f"Sending request to Gemini for Q {question_name_for_log}...")
        response = requests.post(api_url, json=payload, headers={"Content-Type": "application/json"}, timeout=180)
        print(f"Gemini API response status for Q {question_name_for_log}: {response.status_code}")
        
        if not response.ok:
            error_body = response.text
            logger.error(f"Gemini API request failed for Q {question_name_for_log}. Status: {response.status_code}, Body: {error_body}")
            try:
                error_json = response.json()
                error_message_detail = error_json.get("error", {}).get("message", error_body)
            except json.JSONDecodeError:
                error_message_detail = error_body
            default_error_response["overall_feedback"] = f"Lỗi API Gemini ({response.status_code}): {error_message_detail}"
            return default_error_response

        api_response_json = response.json()

        if not api_response_json.get("candidates") or \
           not api_response_json["candidates"][0].get("content") or \
           not api_response_json["candidates"][0]["content"].get("parts") or \
           not api_response_json["candidates"][0]["content"]["parts"][0].get("text"):
            logger.error(f"Gemini API response for Q {question_name_for_log} missing expected structure. Response: {json.dumps(api_response_json)}")
            error_message_detail = "Phản hồi không hợp lệ từ API Gemini (thiếu cấu trúc nội dung)."
            if api_response_json.get("promptFeedback"):
                prompt_feedback_info = api_response_json.get("promptFeedback")
                logger.error(f"  Prompt Feedback from Gemini: {prompt_feedback_info}")
                error_message_detail += f" Lý do từ Gemini: {prompt_feedback_info.get('blockReason', 'Không rõ') if prompt_feedback_info else 'Không rõ'}."
            default_error_response["overall_feedback"] = error_message_detail
            return default_error_response

        generated_text_json_string = api_response_json["candidates"][0]["content"]["parts"][0]["text"]
        print(f"Generated text (JSON string) from Gemini for Q {question_name_for_log}: {generated_text_json_string[:500]}...")
        parsed_result = json.loads(generated_text_json_string)

        if not isinstance(parsed_result, dict) or \
           not all(k in parsed_result for k in ["total_score_awarded", "overall_feedback", "rubric_scores"]) or \
           not isinstance(parsed_result["rubric_scores"], list):
            logger.error(f"Gemini API response JSON for Q {question_name_for_log} is not in the expected format. Raw: {generated_text_json_string}")
            default_error_response["overall_feedback"] = f"Lỗi định dạng JSON phản hồi từ AI: {generated_text_json_string}"
            return default_error_response

        print(f"Successfully graded essay {question_name_for_log} with Gemini. Score: {parsed_result.get('total_score_awarded')}")
        return parsed_result

    except requests.exceptions.Timeout:
        logger.error(f"Gemini API request timed out for Q {question_name_for_log}.", exc_info=True)
        default_error_response["overall_feedback"] = "Lỗi: Yêu cầu chấm điểm tới AI bị quá thời gian."
        return default_error_response
    except requests.exceptions.RequestException as e_req:
        logger.error(f"Gemini API request (RequestException) failed for Q {question_name_for_log}: {e_req}", exc_info=True)
        default_error_response["overall_feedback"] = f"Lỗi kết nối tới dịch vụ chấm điểm AI: {e_req}"
        return default_error_response
    except json.JSONDecodeError as e_json_dec:
        raw_resp_text_for_log = "N/A"
        if 'response' in locals() and hasattr(response, 'text'):
            raw_resp_text_for_log = response.text[:1000] + "..." if len(response.text) > 1000 else response.text
        elif 'generated_text_json_string' in locals():
             raw_resp_text_for_log = generated_text_json_string[:1000] + "..." if len(generated_text_json_string) > 1000 else generated_text_json_string
        logger.error(f"Failed to parse JSON response from Gemini for Q {question_name_for_log}: {e_json_dec}. Response text sample: {raw_resp_text_for_log}", exc_info=True)
        default_error_response["overall_feedback"] = f"Lỗi đọc/phân tích phản hồi JSON từ AI. Vui lòng kiểm tra log để xem nội dung thô."
        return default_error_response
    except Exception as e_unexpected:
        logger.error(f"Unexpected error during Gemini grading for Q {question_name_for_log}: {e_unexpected}", exc_info=True)
        default_error_response["overall_feedback"] = f"Lỗi không xác định trong quá trình chấm điểm AI: {e_unexpected}"
        return default_error_response