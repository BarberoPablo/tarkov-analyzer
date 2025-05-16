# Escape From Tarkov Inventory Item Detector
This project is a React-based image recognition application for Escape From Tarkov. It allows users to paste a screenshot of their in-game inventory and automatically detect the items within it, along with their prices from the Flea Market. Below is a breakdown of its functionality and key features:

## Main Features:

### 1. Item Detection in Images:
- Users can paste a screenshot of their inventory (using Ctrl + V).
- The image is processed, and the items in the image are detected using Tesseract.js for Optical Character Recognition (OCR).
- Three levels of image scanning are available (Quick Scan, Balanced Scan, and Deep Scan), each applying different grayscale filters to improve detection accuracy.
  
### 2. Image Preprocessing:

- Before being analyzed by Tesseract, the images are filtered in grayscale to improve the detection quality.
- A multiplier is applied to scale up the images, increasing the OCR precision.
  
### 3. Duplicate Item Detection and Removal:

- After items are detected, duplicates are removed, and the total value of the detected items is calculated using price data fetched from a market API.
  
### 4. User Interface:

- Detected items are displayed on top of the inventory image with interactive price buttons. These buttons show the name and price of each item and can be manually closed if needed.
- The application provides the option to test predefined sample images to simulate the detection process.

### 5. Data Loading and State Management:

- Item prices are fetched from an external API via the fetchItems function, which is only called if the prices have not yet been loaded.
- The app uses state to store the inventory image, detected items, the index of the last scan type used, and a loading message while the image is being analyzed.

## Key Components and Features:
- Tesseract.js: Used for recognizing text in the inventory images.
- Image Preprocessing: Grayscale filters and image scaling to enhance OCR accuracy.
- Interactive Price Buttons: Detected items are displayed with floating buttons that show their names and prices, which can be individually closed.
- If a lighter scan filter is applied first (e.g., Quick Scan) and then a heavier filter (e.g., Deep Scan) is used, the heavier filter will only analyze the image using the grayscale values that were not already processed by the previous scan. This optimization speeds up the scanning process by avoiding redundant image analysis. Additionally, the results from the new scan are combined with those from the previous scan, ensuring that all detected items are accounted for. This merging process only occurs if the image hasn't changed and no price tags have been closed, as closing tags would invalidate the previous scan's data.

## Summary:
This application provides an efficient way to detect items and retrieve their prices by using OCR on screenshots of Escape From Tarkov inventories. It allows players to quickly assess the value of their items and make informed selling decisions.
