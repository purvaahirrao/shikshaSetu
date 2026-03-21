import logging
import sys

# Set up logging so you can see the log.info and log.error messages from ocr.py
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

try:
    from ocr import extract_text, generate_answer
except ImportError:
    print("Error: Could not import ocr.py. Make sure ocrtest.py and ocr.py are in the same folder.")
    sys.exit(1)

def run_test(image_path):
    print(f"\n{'='*40}")
    print(f"Testing pipeline with image: {image_path}")
    print(f"{'='*40}\n")

    # Step 1: Read the image file
    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()
    except FileNotFoundError:
        print(f"❌ Error: The file '{image_path}' was not found.")
        print("Please place a test image in the same folder and update the filename.")
        return

    # Step 2: Extract text
    print("⏳ Step 1: Extracting text from image...")
    extracted_text = extract_text(image_bytes)

    if not extracted_text.strip():
        print("⚠️ Warning: No text was extracted. EasyOCR and Tesseract might have failed or the image is blank.")
        return

    print("\n✅ Extracted Text:")
    print("-" * 20)
    print(extracted_text)
    print("-" * 20)

    # Step 3: Generate an answer using Llama
    print("\n⏳ Step 2: Generating answer via Llama CLI (This might take a moment)...")
    answer = generate_answer(extracted_text)

    print("\n✅ Generated Answer:")
    print("-" * 20)
    print(answer)
    print("-" * 20)
    print("\n🎉 Test Complete!")


if __name__ == "__main__":
    # Change "sample_math.png" to the actual name of an image file on your PC
    test_image_filename = "sample_math.png" 
    
    run_test(test_image_filename)