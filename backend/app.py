from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from cdp import Cdp, Wallet
import time

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

CDP_API_KEY_NAME = os.getenv('CDP_API_KEY_NAME')
CDP_API_PRIVATE_KEY = os.getenv('CDP_API_PRIVATE_KEY')

print("\n=== Environment Variables ===")
print(f"CDP_API_KEY_NAME exists: {'Yes' if CDP_API_KEY_NAME else 'No'}")
print(f"CDP_API_PRIVATE_KEY exists: {'Yes' if CDP_API_PRIVATE_KEY else 'No'}\n")

if not CDP_API_KEY_NAME or not CDP_API_PRIVATE_KEY:
    raise EnvironmentError("Missing CDP API credentials in environment variables")

print("Configuring CDP SDK...")
Cdp.configure(CDP_API_KEY_NAME, CDP_API_PRIVATE_KEY)
print("CDP SDK configured successfully\n")

wallet = None
REQUIRED_BALANCE = 0.01

def request_funds(wallet):
    """Request funds from faucet and wait for balance to increase"""
    print("\nRequesting funds from faucet...")
    initial_balance = float(wallet.balance("eth"))
    print(f"Initial balance: {initial_balance} ETH")

    try:
        # Request ETH from faucet
        print("Sending faucet request...")
        wallet.faucet()
        
        # Wait and check for balance increase
        max_attempts = 10
        for attempt in range(max_attempts):
            print(f"Checking balance (attempt {attempt + 1}/{max_attempts})...")
            time.sleep(5)  # Wait 5 seconds between checks
            
            new_balance = float(wallet.balance("eth"))
            print(f"Current balance: {new_balance} ETH")
            
            if new_balance > initial_balance:
                print("Balance increased! Faucet request successful")
                return {
                    "success": True,
                    "balance": new_balance,
                    "status": "FAUCET_SUCCESS"
                }
                
        print("Timed out waiting for balance increase")
        return {
            "success": False,
            "status": "FAUCET_TIMEOUT"
        }
        
    except Exception as e:
        print(f"Error requesting from faucet: {e}")
        return {
            "success": False,
            "status": "FAUCET_ERROR",
            "error": str(e)
        }

def create_funded_wallet():
    """Create a new wallet and ensure it has funds"""
    try:
        wallet = Wallet.create(network_id="base-sepolia")
        print(f"\nCreated new wallet with address: {wallet.default_address}")
        
        # Check initial balance
        balance = float(wallet.balance("eth"))
        print(f"Initial balance: {balance} ETH")
        
        if balance >= REQUIRED_BALANCE:
            print("Wallet already has sufficient funds!")
            return {
                "success": True,
                "wallet": wallet,
                "balance": balance,
                "status": "WALLET_FUNDED"
            }
            
        # Try to get funds from faucet
        faucet_result = request_funds(wallet)
        if faucet_result["success"]:
            final_balance = float(wallet.balance("eth"))
            if final_balance >= REQUIRED_BALANCE:
                print(f"Successfully funded wallet. Final balance: {final_balance} ETH")
                return {
                    "success": True,
                    "wallet": wallet,
                    "balance": final_balance,
                    "status": "WALLET_FUNDED"
                }
            
        print("Failed to get sufficient funds")
        return {
            "success": False,
            "status": "INSUFFICIENT_FUNDS"
        }
            
    except Exception as e:
        print(f"Error creating wallet: {e}")
        return {
            "success": False,
            "status": "WALLET_ERROR",
            "error": str(e)
        }

@app.route('/api/deploy', methods=['POST'])
def deploy_contract():
    try:
        print("\n=== Starting Contract Deployment ===")
        data = request.json
        print(f"Received data: {data}")

        # Create new wallet
        print("\nCreating new wallet...")
        wallet_result = create_funded_wallet()
        
        if not wallet_result["success"]:
            return jsonify({
                "success": False,
                "error": f"Wallet creation failed: {wallet_result.get('status')}",
                "step": "WALLET_CREATION"
            }), 400

        wallet = wallet_result["wallet"]
        final_balance = wallet_result["balance"]

        # Verify final balance before deployment
        print(f"\nFinal wallet balance before deployment: {final_balance} ETH")
        
        if final_balance < REQUIRED_BALANCE:
            return jsonify({
                "success": False,
                "error": f"Insufficient balance ({final_balance} ETH) for deployment",
                "step": "BALANCE_CHECK"
            }), 400

        contract_type = data['type']
        name = data['name']
        symbol = data.get('symbol', 'NFT')
        base_uri = data['baseURI']

        print(f"\nDeployment details:")
        print(f"- Type: {contract_type}")
        print(f"- Name: {name}")
        print(f"- Symbol: {symbol}")
        print(f"- URI: {base_uri}")
        print(f"- Using wallet: {wallet.default_address}")
        print(f"- Wallet balance: {final_balance} ETH")

        print("\nStarting contract deployment...")
        if contract_type == "ERC721":
            print("Deploying ERC721 contract...")
            deployed_contract = wallet.deploy_nft(name, symbol, base_uri)
        elif contract_type == "ERC1155":
            print("Deploying ERC1155 contract...")
            deployed_contract = wallet.deploy_multi_token(base_uri)
        else:
            print(f"Error: Unsupported contract type: {contract_type}")
            return jsonify({
                "success": False,
                "error": "Unsupported contract type",
                "step": "CONTRACT_TYPE_CHECK"
            }), 400

        print("\nWaiting for deployment to complete...")
        deployed_contract.wait()
        
        contract_address = deployed_contract.contract_address
        print(f"\nContract deployed successfully!")
        print(f"Contract address: {contract_address}")

        return jsonify({
            "success": True,
            "contract_address": contract_address,
            "wallet_address": str(wallet.default_address),
            "wallet_balance": str(final_balance),
            "status": "DEPLOYMENT_COMPLETE",
            "steps": {
                "wallet_creation": "complete",
                "funding": "complete",
                "deployment": "complete",
                "confirmation": "complete"
            }
        })
    
    except Exception as e:
        print(f"\nERROR during deployment:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback:\n{traceback.format_exc()}")
        
        return jsonify({
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__,
            "step": "DEPLOYMENT"
        }), 500

if __name__ == "__main__":
    print("\n=== Starting Flask Server ===")
    print("Routes available:")
    print("- POST /api/deploy - Deploy NFT contract")
    print("- GET /test - Test endpoint")
    print("\nStarting server on http://localhost:3001")
    app.run(port=3001, debug=True)