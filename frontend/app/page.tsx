"use client";

import { useState } from "react";
import { pinata } from "@/utils/pinataConfig";

interface DeploymentStep {
  message: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

const DeploymentStatus = ({ steps }: { steps: DeploymentStep[] }) => {
  return (
    <div className="w-full max-w-md bg-white p-6 mt-6 rounded-lg shadow-md">
      <h3 className="font-bold mb-4 text-gray-800">Deployment Progress</h3>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {step.status === 'pending' && (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-3" />
            )}
            {step.status === 'loading' && (
              <div className="w-4 h-4 mr-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
              </div>
            )}
            {step.status === 'complete' && (
              <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {step.status === 'error' && (
              <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={`
              ${step.status === 'complete' ? 'text-green-700' : ''}
              ${step.status === 'loading' ? 'text-blue-700' : ''}
              ${step.status === 'error' ? 'text-red-700' : ''}
              ${step.status === 'pending' ? 'text-gray-400' : ''}
            `}>
              {step.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


export default function Home() {
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    image: "",
    attributes: "",
  });
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAttributeInfo, setShowAttributeInfo] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState("");
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMetadata((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const populateERC721 = () => {
    setMetadata({
      name: "Sample ERC721 NFT",
      description: "This is an example metadata for an ERC721 NFT.",
      image: "https://example.com/sample-image.png",
      attributes: JSON.stringify(
        [
          { trait_type: "Base", value: "Starfish" },
          { trait_type: "Eyes", value: "Big" },
          { trait_type: "Level", value: 5 },
          {
            display_type: "boost_percentage",
            trait_type: "Stamina Increase",
            value: 10,
          },
        ],
        null,
        2
      ),
    });
  };

  const populateERC1155 = () => {
    setMetadata({
      name: "Sample ERC1155 NFT",
      description: "This is an example metadata for an ERC1155 NFT.",
      image: "https://example.com/sample-image.png",
      attributes: JSON.stringify(
        [
          { trait_type: "Material", value: "Gold" },
          { trait_type: "Durability", value: 80 },
          { display_type: "number", trait_type: "Level", value: 2 },
        ],
        null,
        2
      ),
    });
  };

  const uploadMetadata = async () => {
    if (
      !metadata.name ||
      !metadata.description ||
      !metadata.image ||
      !metadata.attributes
    ) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      setUploading(true);
      setErrorMessage("");

      let parsedAttributes;
      try {
        parsedAttributes = JSON.parse(metadata.attributes);
      } catch (e) {
        alert(
          "Invalid JSON format in attributes. Please ensure attributes are valid JSON."
        );
        setUploading(false);
        return;
      }

      const nftMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        attributes: parsedAttributes,
      };

      interface DeploymentStep {
        message: string;
        status: 'pending' | 'loading' | 'complete' | 'error';
      }
      
      const DeploymentStatus = ({ steps }: { steps: DeploymentStep[] }) => {
        return (
          <div className="w-full max-w-md bg-white p-6 mt-6 rounded-lg shadow-md">
            <h3 className="font-bold mb-4 text-gray-800">Deployment Progress</h3>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  {step.status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-3" />
                  )}
                  {step.status === 'loading' && (
                    <div className="w-4 h-4 mr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                    </div>
                  )}
                  {step.status === 'complete' && (
                    <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {step.status === 'error' && (
                    <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`
                    ${step.status === 'complete' ? 'text-green-700' : ''}
                    ${step.status === 'loading' ? 'text-blue-700' : ''}
                    ${step.status === 'error' ? 'text-red-700' : ''}
                    ${step.status === 'pending' ? 'text-gray-400' : ''}
                  `}>
                    {step.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      };

      console.log("Uploading Metadata: ", nftMetadata);

      const uploadResponse = await pinata.upload.json(nftMetadata);
      console.log("Upload Response: ", uploadResponse);

      if (uploadResponse?.IpfsHash) {
        const ipfsLink = `https://ipfs.io/ipfs/${uploadResponse.IpfsHash}`;
        setIpfsUrl(ipfsLink);
      } else {
        throw new Error("Upload failed, no IpfsHash returned.");
      }

      setUploading(false);
    } catch (e: any) {
      console.error("Error details:", e.response || e);
      setErrorMessage(
        "Error uploading metadata: " +
          (e.response?.data?.message || e.message || e)
      );
      setUploading(false);
    }
  };

  const deployContract = async (type: "ERC721" | "ERC1155") => {
    if (!ipfsUrl) {
      alert("Please upload metadata to IPFS before deploying.");
      return;
    }
  
    try {
      setDeploying(true);
      setErrorMessage("");
      setDeployedAddress("");
  
      // Initialize steps
      setDeploymentSteps([
        { message: "Creating new wallet on Base Sepolia...", status: 'loading' as const },
        { message: "Requesting testnet ETH from faucet...", status: 'pending' as const },
        { message: `Deploying ${type} contract...`, status: 'pending' as const },
        { message: "Waiting for transaction confirmation...", status: 'pending' as const }
      ]);
  
      // Poll for updates every second
      const pollInterval = setInterval(() => {
        setDeploymentSteps(current => {
          // Find the current loading step
          const loadingIndex = current.findIndex(step => step.status === 'loading');
          if (loadingIndex >= 0 && loadingIndex < current.length - 1) {
            // Complete the current step and start the next one
            return current.map((step, index) => {
              if (index === loadingIndex) {
                return { ...step, status: 'complete' as const };
              }
              if (index === loadingIndex + 1) {
                return { ...step, status: 'loading' as const };
              }
              return step;
            });
          }
          return current;
        });
      }, 5000); // Update every 5 seconds
  
      const response = await fetch('http://localhost:3001/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          name: metadata.name,
          symbol: type === "ERC721" ? "NFT" : "MULTI",
          baseURI: ipfsUrl,
        })
      });
  
      // Clear the polling interval
      clearInterval(pollInterval);
  
      const data = await response.json();
      
      if (data.success) {
        // Update all steps to complete
        setDeploymentSteps(current => {
          const updatedSteps = current.map(step => ({
            ...step,
            status: 'complete' as const
          }));
          
          // Add the final success step
          return [
            ...updatedSteps,
            {
              message: `Contract deployed at: ${data.contract_address}`,
              status: 'complete' as const
            }
          ];
        });
  
        setDeployedAddress(data.contract_address);
  
        alert(
          `Contract successfully deployed!\n\n` +
          `Contract Address: ${data.contract_address}\n` +
          `Wallet Address: ${data.wallet_address}\n` +
          `Wallet Balance: ${data.wallet_balance} ETH\n\n` +
          `View on BaseScan: https://sepolia.basescan.org/address/${data.contract_address}`
        );
      } else {
        throw new Error(data.error || "Failed to deploy contract");
      }
  
    } catch (error: any) {
      console.error("Deployment error:", error);
      setErrorMessage(
        typeof error === 'string' 
          ? error 
          : error.message || "Failed to deploy contract"
      );
      
      // Update the current loading step to error
      setDeploymentSteps(current =>
        current.map(step => 
          step.status === 'loading' ? { ...step, status: 'error' as const } : step
        )
      );
    } finally {
      setDeploying(false);
    }
  };

  return (
    <main className="w-full min-h-screen p-8 flex flex-col items-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Upload NFT Metadata to Pinata & Deploy Contracts
      </h1>

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-bold mb-4">About ERC721 vs ERC1155</h2>
        <p className="text-gray-700 mb-4">Ethereum's main token types:</p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>ERC-20: Regular tokens that are all identical</li>
          <li>ERC-721: NFTs where each token is unique (like digital art)</li>
          <li>
            ERC-1155: Most flexible - can do both unique and identical items
          </li>
        </ul>
        <p className="text-gray-700">
          Choose ERC-721 for unique items only, or ERC-1155 for more flexibility
          and lower costs.
        </p>
      </div>

      <div className="mb-6 w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between mb-4">
          <button
            onClick={populateERC721}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
            disabled={uploading}
          >
            Use ERC721 Standard
          </button>
          <button
            onClick={populateERC1155}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-200"
            disabled={uploading}
          >
            Use ERC1155 Standard
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowAttributeInfo(!showAttributeInfo)}
            className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200 w-full text-left"
          >
            {showAttributeInfo ? "Hide" : "Show"} Attribute Information
          </button>
          {showAttributeInfo && (
            <div className="bg-gray-50 p-4 rounded-lg mt-2 text-gray-800">
              <h3 className="font-bold mb-2">Attributes Overview</h3>
              <p className="mb-2">
                The <strong>attributes</strong> you define are the metadata
                properties that make each NFT unique. These can vary based on the
                token standard:
              </p>
              <ul className="list-disc list-inside mb-2">
                <li>
                  For <strong>ERC-721</strong>, attributes often represent traits
                  such as visual features or status values.
                </li>
                <li>
                  For <strong>ERC-1155</strong>, attributes can be more dynamic,
                  representing properties for game items or collectibles.
                </li>
              </ul>
              <p>
                Ensure attributes are formatted as valid JSON, using
                <code> trait_type</code> and <code>value</code> pairs.
              </p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-gray-700">
            NFT Name:
          </label>
          <input
            type="text"
            name="name"
            value={metadata.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-200"
            disabled={uploading}
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-gray-700">
            Description:
          </label>
          <textarea
            name="description"
            value={metadata.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-200"
            disabled={uploading}
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-gray-700">
            Image URL:
          </label>
          <input
            type="text"
            name="image"
            value={metadata.image}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-200"
            disabled={uploading}
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-gray-700">
            Attributes (JSON format):
          </label>
          <textarea
            name="attributes"
            value={metadata.attributes}
            onChange={handleChange}
            placeholder='e.g. [{"trait_type": "Base", "value": "Starfish"}]'
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-200"
            disabled={uploading}
          />
        </div>

        <button
          disabled={uploading}
          onClick={uploadMetadata}
          className={`w-full text-white font-semibold px-4 py-3 rounded-lg transition-all duration-300 ${
            uploading
              ? "bg-blue-400 cursor-not-allowed opacity-75"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload Metadata"}
        </button>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => deployContract("ERC721")}
            className={`bg-blue-500 text-white px-4 py-2 rounded-lg transition duration-200 w-full mr-2 ${
              deploying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
            disabled={deploying || !ipfsUrl}
          >
            {deploying ? "Deploying..." : "Deploy ERC-721 NFT Contract"}
          </button>
          <button
            onClick={() => deployContract("ERC1155")}
            className={`bg-blue-500 text-white px-4 py-2 rounded-lg transition duration-200 w-full ml-2 ${
              deploying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
            disabled={deploying || !ipfsUrl}
          >
            {deploying ? "Deploying..." : "Deploy ERC-1155 Contract"}
          </button>
        </div>
      </div>

      {ipfsUrl && (
        <div className="w-full max-w-md bg-white p-6 mt-6 rounded-lg shadow-md">
          <p className="font-semibold text-gray-700 mb-2">IPFS URL:</p>
          <a
            href={ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {ipfsUrl}
          </a>
        </div>
      )}

      {deploying && (
        <div className="w-full max-w-md bg-blue-100 p-6 mt-6 rounded-lg shadow-md">
          <p className="text-blue-800">
            Attempting to deploy contract. This may take a few minutes as we request funds from faucet...
          </p>
        </div>
      )}

      {deploying && <DeploymentStatus steps={deploymentSteps} />}

      {deployedAddress && (
        <div className="w-full max-w-md bg-green-100 p-6 mt-6 rounded-lg shadow-md">
          <p className="font-semibold text-green-800 mb-2">Contract Deployed Successfully!</p>
          <p className="text-green-700 break-all">
            Contract Address: {deployedAddress}
          </p>
          <a
            href={`https://sepolia.basescan.org/address/${deployedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline mt-2 inline-block"
          >
            View on BaseScan
          </a>
        </div>
      )}

      {errorMessage && (
        <div className="w-full max-w-md bg-red-100 text-red-800 p-4 mt-6 rounded-lg shadow-md">
          <p>{errorMessage}</p>
        </div>
      )}
    </main>
  );
}