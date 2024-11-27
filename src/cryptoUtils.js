// Simple Base64 encoding/decoding
export const encryptParam = (data) => {
    return btoa(data); // Base64 encode
  };
  
  export const decryptParam = (data) => {
    try {
      return atob(data); // Base64 decode
    } catch (error) {
      console.error("Invalid encrypted data", error);
      return null;
    }
  };
  