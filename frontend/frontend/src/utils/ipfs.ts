const IPFS_API_URL = "http://127.0.0.1:5001/api/v0/add";
const IPFS_GATEWAY_URL = "http://127.0.0.1:8080/ipfs";

function extractCidFromIpfsAddResponse(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const last = lines[lines.length - 1];
  const json = JSON.parse(last);
  return json.Hash as string;
}

/**
 * Upload a JSON object as a file to your local IPFS node.
 * Returns { cid, url } where url is your local gateway URL.
 */
export async function uploadJSONToIPFS(
  json: object,
  name = "metadata.json"
): Promise<{ cid: string; url: string }> {
  const blob = new Blob([JSON.stringify(json)], {
    type: "application/json",
  });

  const formData = new FormData();
  formData.append("file", blob, name);

  const res = await fetch(IPFS_API_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Local IPFS JSON upload failed:", body);
    throw new Error("Failed to upload metadata to local IPFS node");
  }

  const text = await res.text();
  const cid = extractCidFromIpfsAddResponse(text);

  return {
    cid,
    url: `${IPFS_GATEWAY_URL}/${cid}`,
  };
}
