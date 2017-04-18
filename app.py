from flask import Flask, redirect, url_for, render_template, request, flash

import os
from os.path import join, dirname
from dotenv import load_dotenv
import braintree

app = Flask(__name__)
dotenv_path = 'my.env'
load_dotenv(dotenv_path)
app.secret_key = os.environ.get('APP_SECRET_KEY')

braintree.Configuration.configure(
    os.environ.get('BT_ENVIRONMENT'),
    os.environ.get('BT_MERCHANT_ID'),
    os.environ.get('BT_PUBLIC_KEY'),
    os.environ.get('BT_PRIVATE_KEY')
)

TRANSACTION_SUCCESS_STATUSES = [
    braintree.Transaction.Status.Authorized,
    braintree.Transaction.Status.Authorizing,
    braintree.Transaction.Status.Settled,
    braintree.Transaction.Status.SettlementConfirmed,
    braintree.Transaction.Status.SettlementPending,
    braintree.Transaction.Status.Settling,
    braintree.Transaction.Status.SubmittedForSettlement
]

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/receipt', methods=['GET'])
def receipt():
    return render_template('receipt.html')


@app.route('/token', methods=['GET'])
def new_token():
    client_token = braintree.ClientToken.generate()
    return client_token

@app.route('/payment', methods=['POST'])
def payment():

    customerResult = braintree.Customer.create({
        "first_name": request.form['firstName'],
        "last_name": request.form['lastName'],
        "credit_card": {
            "payment_method_nonce": request.form['nonce'],
            "options": {
                "verify_card": True
            }
        }
    })

    # app.logger.info(customerResult)
    if customerResult.is_success:
        saleresult = braintree.Transaction.sale({
            'amount': request.form['amount'],
            'customer_id': customerResult.customer.id,
            'payment_method_token': customerResult.customer.payment_methods[0].token,
            'options': {
                "submit_for_settlement": True
            }
        })
        #app.logger.info(saleresult)
        if saleresult.is_success:
            return "true"

    return "false"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4568, debug=True)