v.zero API Setup Instructions
1. In terminal browse to VzeroAPI directory
2. Install requirements:- pip install -r requirements.txt
3. Copy the contents of example.env into a new file named .env and fill in your Braintree API credentials. Credentials can be found by navigating to Account > My User > View Authorizations in the Braintree Control Panel. Full instructions can be found on our support site.
4. Start server:- python3 app.py
5. Open server: http://0.0.0.0:4568/
6. Fill all the text boxes correctly, and click on “Pay with Card”
7. Check Vault and Transactions in your Braintree API account