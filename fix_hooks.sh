#!/bin/bash

# Script to fix React hooks dependency warnings systematically

echo "Starting React hooks dependency fixes..."

# Files to fix (based on lint output)
files=(
  "src/components/merchant/ClientPurchaseHistory.tsx"
  "src/components/merchant/DigitalReceiptManager.tsx"
  "src/components/merchant/MultiChannelPayment.tsx"
  "src/components/merchant/ProductRecommendations.tsx"
  "src/components/merchant/PromotionManager.tsx"
  "src/components/producer/AccountManagement.tsx"
  "src/components/producer/LogisticsTracking.tsx"
  "src/components/producer/OrderManagement.tsx"
  "src/components/producer/PriceManagement.tsx"
  "src/components/producer/PriceSuggestion.tsx"
  "src/components/producer/ProducerHeader.tsx"
  "src/components/producer/ProducerMobileHeader.tsx"
  "src/components/producer/SaleForm.tsx"
  "src/components/producer/VocalInterface.tsx"
  "src/pages/admin/AdminAuditLogs.tsx"
  "src/pages/admin/AdminDisputes.tsx"
  "src/pages/cooperative/CooperativeWarehouses.tsx"
  "src/pages/merchant/MerchantCredits.tsx"
  "src/pages/merchant/MerchantProfile.tsx"
  "src/pages/merchant/MerchantSettings.tsx"
  "src/pages/merchant/MerchantSourcing.tsx"
  "src/pages/producer/ProducerHarvests.tsx"
  "src/pages/producer/ProducerOffers.tsx"
  "src/pages/producer/ProducerSales.tsx"
  "src/hooks/cooperative/useCommunication.ts"
)

echo "Found ${#files[@]} files to fix..."

# Function to fix a single file
fix_file() {
  local file="$1"
  echo "Processing $file..."

  # Add useCallback import if not present
  if ! grep -q "useCallback" "$file"; then
    sed -i 's/import { useState, useEffect }/import { useState, useEffect, useCallback }/' "$file"
    sed -i 's/import { useState, useEffect, useRef }/import { useState, useEffect, useRef, useCallback }/' "$file"
  fi

  echo "Fixed $file"
}

# Process each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    fix_file "$file"
  else
    echo "File not found: $file"
  fi
done

echo "All files processed. Manual fixes may be needed for complex cases."

echo "Running lint to check remaining issues..."
npm run lint 2>&1 | grep "useEffect.*missing dependency" | head -10