import hashlib
import time
import json

class Blockchain:
    def __init__(self):
        self.chain = []
        self.pending_transactions = []
        self.create_block(previous_hash='1', proof=100)  # Genesis block

    def create_block(self, proof, previous_hash):
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time.time(),
            'transactions': self.pending_transactions,
            'proof': proof,
            'previous_hash': previous_hash,
        }
        self.pending_transactions = []  # Reset pending transactions
        self.chain.append(block)
        return block

    def get_last_block(self):
        return self.chain[-1]

    def add_transaction(self, sender, receiver, amount):
        self.pending_transactions.append({
            'sender': sender,
            'receiver': receiver,
            'amount': amount,
        })
        return self.get_last_block()['index'] + 1

    def proof_of_work(self, previous_proof):
        proof = 0
        while not self.is_valid_proof(previous_proof, proof):
            proof += 1
        return proof

    @staticmethod
    def is_valid_proof(previous_proof, proof):
        guess = f'{previous_proof}{proof}'.encode()
        guess_hash = hashlib.sha256(guess).hexdigest()
        return guess_hash[:4] == "0000"  # Difficulty level

    @staticmethod
    def hash(block):
        encoded_block = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(encoded_block).hexdigest()
