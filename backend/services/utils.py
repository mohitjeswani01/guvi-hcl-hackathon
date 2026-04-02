import base64
import binascii

def decode_base64_file(file_base64: str) -> bytes:
    """
    Decodes a base64 encoded string into bytes.
    Handles potential padding issues and checks for data URI schemes.
    """
    try:
        # Check if the string contains a data URI scheme (e.g. data:image/png;base64,...)
        if "," in file_base64:
            file_base64 = file_base64.split(",", 1)[1]
            
        # Add required padding if it's missing (base64 strings must be a multiple of 4)
        missing_padding = len(file_base64) % 4
        if missing_padding:
            file_base64 += "=" * (4 - missing_padding)
            
        return base64.b64decode(file_base64, validate=True)
    except binascii.Error as e:
        raise ValueError(f"Invalid Base64 string: {e}")
    except Exception as e:
        raise ValueError(f"Failed to decode Base64: {e}")
