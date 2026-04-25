import yfinance as yf
import pandas as pd
import numpy as np
import time
from datetime import datetime
from flask import Flask, jsonify
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

app = Flask(__name__)

# Functions from your original code (e.g., get_stock_data, train_model, etc.)

@app.route('/predict', methods=['GET'])
def predict():
    ticker = "SOFI"
    data = get_stock_data(ticker)
    stock_price = data['Close'].iloc[-1]

    # Fetch and process data
    data = add_technical_indicators(data)
    features, target = prepare_data(data)

    # Train model
    model = train_model(features, target)

    # Predict future price
    last_row = features.iloc[-1].values
    prediction = model.predict([last_row])[0]

    # Fetch options data and calculate profitability
    calls, puts = get_options_data(ticker)
    best_call, best_put = calculate_option_profitability(calls, puts, stock_price)

    response = {
        "current_stock_price": stock_price,
        "predicted_stock_price": prediction,
        "best_call_option": best_call.to_dict(orient='records'),
        "best_put_option": best_put.to_dict(orient='records'),
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)


# Fetch stock data
def get_stock_data(ticker, period="1d"):
    stock = yf.Ticker(ticker)
    data = stock.history(period=period, interval="1m")
    data['Date'] = data.index
    data['Date'] = pd.to_datetime(data['Date'])
    return data

# Fetch options data
def get_options_data(ticker):
    stock = yf.Ticker(ticker)
    calls = stock.option_chain().calls
    puts = stock.option_chain().puts
    return calls, puts

# Calculate intrinsic value and profitability for options
def calculate_option_metrics(stock_price, options, option_type):
    if option_type == "call":
        options['Intrinsic Value'] = np.where(
            options['strike'] < stock_price,
            stock_price - options['strike'],
            0
        )
    elif option_type == "put":
        options['Intrinsic Value'] = np.where(
            options['strike'] > stock_price,
            options['strike'] - stock_price,
            0
        )
    else:
        raise ValueError("Invalid option type. Must be 'call' or 'put'.")

    options['Profit Potential'] = options['Intrinsic Value'] - options['lastPrice']
    options['Profitability'] = (options['Profit Potential'] / options['lastPrice']) * 100

    # Sorting by profitability in descending order
    return options.sort_values(by='Profitability', ascending=False)


# Main function
def main():
    ticker = "SOFI"
    while True:
        print(f"\nFetching data for {ticker} at {datetime.now()}...")

        # Fetch stock price
        stock_data = get_stock_data(ticker)
        latest_price = stock_data['Close'].iloc[-1]
        print(f"Predicted stock price for {ticker}: {latest_price:.2f}")

        # Fetch options data
        calls, puts = get_options_data(ticker)

        # Process options
        print("\nProcessing options...")
        calls = calculate_option_metrics(latest_price, calls, "call")
        puts = calculate_option_metrics(latest_price, puts, "put")

        # Identify best call and put options
        best_call = calls.iloc[0]
        best_put = puts.iloc[0]

        # Display results
        print("\nOptions Calls (Top 5):")
        print(calls.head(5))
        print("\nOptions Puts (Top 5):")
        print(puts.head(5))

        print("\nBest Call Option:")
        print(best_call[['contractSymbol', 'strike', 'lastPrice', 'Intrinsic Value', 'Profit Potential', 'Profitability']])

        print("\nBest Put Option:")
        print(best_put[['contractSymbol', 'strike', 'lastPrice', 'Intrinsic Value', 'Profit Potential', 'Profitability']])

        # Wait for 5 minutes
        print("\nWaiting 5 minutes before the next update...\n")
        time.sleep(300)

if __name__ == "__main__":
    main()
