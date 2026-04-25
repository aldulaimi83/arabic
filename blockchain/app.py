from flask import Flask, jsonify, request
from blockchain import Blockchain

app = Flask(__name__)

blockchain = Blockchain()

@app.route('/mine', methods=['GET'])
def mine_block():
    previous_block = blockchain.get_last_block()
    previous_proof = previous_block['proof']
    proof = blockchain.proof_of_work(previous_proof)
    previous_hash = blockchain.hash(previous_block)
    block = blockchain.create_block(proof, previous_hash)
    return jsonify(block), 200

@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    transaction_data = request.get_json()
    required_fields = ['sender', 'receiver', 'amount']
    if not all(field in transaction_data for field in required_fields):
        return 'Missing fields', 400
    index = blockchain.add_transaction(
        transaction_data['sender'],
        transaction_data['receiver'],
        transaction_data['amount']
    )
    return jsonify({'message': f'Transaction will be added to Block {index}'}), 201

@app.route('/chain', methods=['GET'])
def get_chain():
    response = {
        'chain': blockchain.chain,
        'length': len(blockchain.chain),
    }
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
