import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_percentage_error

# Fetch SOFI stock data
def get_stock_data(ticker, period="1y"):
    stock = yf.Ticker(ticker)
    data = stock.history(period=period)
    data['Date'] = data.index
    data['Date'] = pd.to_datetime(data['Date'])
    return data

# Add technical indicators manually
def add_technical_indicators(data):
    # Simple Moving Averages (SMA)
    data['SMA_20'] = data['Close'].rolling(window=20).mean()
    data['SMA_50'] = data['Close'].rolling(window=50).mean()
    
    # Relative Strength Index (RSI)
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    data['RSI'] = 100 - (100 / (1 + rs))
    
    # Bollinger Bands
    data['BB_middle'] = data['Close'].rolling(window=20).mean()
    data['BB_std'] = data['Close'].rolling(window=20).std()
    data['BB_upper'] = data['BB_middle'] + (2 * data['BB_std'])
    data['BB_lower'] = data['BB_middle'] - (2 * data['BB_std'])
    
    # Drop rows with NaN values created during rolling calculations
    return data.dropna()

# Prepare data for training
def prepare_data(data):
    data['Date_ordinal'] = data['Date'].map(pd.Timestamp.toordinal)
    features = data[['Date_ordinal', 'Volume', 'SMA_20', 'SMA_50', 'RSI', 'BB_upper', 'BB_middle', 'BB_lower']]
    target = data['Close']
    return features, target

# Train the model
def train_model(features, target):
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    r2 = r2_score(y_test, predictions)
    mape = mean_absolute_percentage_error(y_test, predictions)
    print(f"Model trained with R²: {r2:.4f}, MAPE: {mape:.4f}")
    return model

# Predict future prices
def predict_future(model, last_row, days=5):
    future_predictions = []
    for _ in range(days):
        features = np.array([last_row]).reshape(1, -1)
        prediction = model.predict(features)[0]
        future_predictions.append(prediction)
        # Simulate the next day with new values (adjust simulation as needed)
        last_row[0] += 1  # Increment date ordinal
        last_row[2] = (last_row[2] + prediction) / 2  # Adjust SMA_20 simplistically
        last_row[3] = (last_row[3] + prediction) / 2  # Adjust SMA_50 simplistically
        last_row[4] = min(max(0, last_row[4] + np.random.uniform(-5, 5)), 100)  # Adjust RSI within bounds
        last_row[5:] = prediction  # Adjust Bollinger bands to follow the predicted price
    return future_predictions

# Main function
def main():
    ticker = "SOFI"
    print(f"Fetching data for {ticker}...")
    data = get_stock_data(ticker)

    print("Adding technical indicators...")
    data = add_technical_indicators(data)

    print("Preparing data...")
    features, target = prepare_data(data)

    print("Training model...")
    model = train_model(features, target)

    print("Predicting future prices...")
    last_row = features.iloc[-1].values  # Use the last row of features as a starting point
    future_predictions = predict_future(model, last_row, days=5)
    print(f"Predicted prices for the next 5 days: {future_predictions}")

    print("Full Data: ")
    print(data)

if __name__ == "__main__":
    main()
