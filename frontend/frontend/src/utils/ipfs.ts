export async function uploadFileToIPFS(file: File) {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  if (!jwt) {
    throw new Error("Missing VITE_PINATA_JWT in .env");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!res.ok) {
    console.error("Pinata file upload failed", await res.text());
    throw new Error("Failed to upload file to IPFS");
  }

  const data = await res.json();
  const cid = data.IpfsHash as string;

  return {
    cid,
    url: `https://gateway.pinata.cloud/ipfs/${cid}`,
  };
}

// Upload JSON METADATA to IPFS using Pinata + JWT
export async function uploadJSONToIPFS(json: object, name?: string) {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  if (!jwt) {
    throw new Error("Missing VITE_PINATA_JWT in .env");
  }

  const body = {
    pinataContent: json,
    ...(name
      ? {
          pinataMetadata: {
            name,
          },
        }
      : {}),
  };

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Pinata JSON upload failed", await res.text());
    throw new Error("Failed to upload metadata to IPFS");
  }

  const data = await res.json();
  const cid = data.IpfsHash as string;

  return {
    cid,
    url: `https://gateway.pinata.cloud/ipfs/${cid}`,
  };
}
