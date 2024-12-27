import yfinance as yf
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import numpy as np

# Fetch SOFI stock data
def get_stock_data(ticker, period="1y"):
    stock = yf.Ticker(ticker)
    data = stock.history(period=period)
    data['Date'] = data.index
    return data

# Prepare data for training
def prepare_data(data):
    data['Date'] = pd.to_datetime(data['Date'])
    data['Date_ordinal'] = data['Date'].map(pd.Timestamp.toordinal)
    features = data[['Date_ordinal']]
    target = data['Close']
    return features, target

# Train the model
def train_model(features, target):
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
    model = LinearRegression()
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    print(f"Model trained with MSE: {mse}")
    return model

# Predict future prices
def predict_future(model, days=1):
    last_date = pd.Timestamp.today().toordinal()
    future_dates = np.array([last_date + i for i in range(1, days + 1)]).reshape(-1, 1)
    predictions = model.predict(future_dates)
    return predictions

# Main function
def main():
    ticker = "SOFI"
    print(f"Fetching data for {ticker}...")
    data = get_stock_data(ticker)

    print("Preparing data...")
    features, target = prepare_data(data)

    print("Training model...")
    model = train_model(features, target)

    print("Predicting future prices...")
    future_predictions = predict_future(model, days=5)
    print(f"Predicted prices for the next 5 days: {future_predictions}")

    print("Full Data: ")
    print(data)

if __name__ == "__main__":
    main()
