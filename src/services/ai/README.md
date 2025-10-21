# AI Services Documentation

This directory contains advanced AI-powered services that enhance the agricultural commerce platform with intelligent features.

## Services Overview

### 1. AI Base Service (`aiBaseService.ts`)
Core AI utilities and helper functions used by all AI services.

**Features:**
- Data normalization and preprocessing
- Moving averages and trend calculation
- Seasonality detection
- Correlation analysis
- Statistical functions

### 2. Inventory Prediction Service (`inventoryPredictionService.ts`)
Predicts stock needs and prevents stockouts using machine learning algorithms.

**Key Features:**
- Stock demand forecasting
- Reorder point recommendations
- Economic Order Quantity (EOQ) calculation
- Safety stock calculations
- Anomaly detection in demand patterns
- 30-day demand forecasting

**Usage Example:**
```typescript
import { inventoryPredictionService } from '@/services/ai';

const prediction = await inventoryPredictionService.predictStockNeeds(
  'product-123',
  'Tomates Bio',
  50, // current stock
  1500, // average price
  'legumes' // category
);

console.log(`Predicted demand: ${prediction.predictedDemand}`);
console.log(`Reorder at: ${prediction.recommendedReorderPoint}`);
console.log(`Days until stockout: ${prediction.daysUntilStockout}`);
```

### 3. Price Optimization Service (`priceOptimizationService.ts`)
Provides intelligent pricing recommendations based on market dynamics.

**Key Features:**
- Dynamic pricing based on demand and competition
- Price elasticity analysis
- Competitive pricing analysis
- Optimal price point calculation
- Real-time price adjustments based on time of day, stock levels, and demand

**Usage Example:**
```typescript
import { priceOptimizationService } from '@/services/ai';

const optimization = await priceOptimizationService.optimizePrice(
  'product-123',
  'Tomates Bio',
  1500, // current price
  800, // cost
  'legumes',
  'Bio',
  100 // current volume
);

console.log(`Optimized price: ${optimization.optimizedPrice} FCFA`);
console.log(`Expected revenue change: ${optimization.expectedImpact.revenueChange}%`);
```

### 4. Enhanced Recommendation Service (`enhancedRecommendationService.ts`)
Provides personalized product recommendations using collaborative filtering and content-based approaches.

**Key Features:**
- Collaborative filtering (users who bought X also bought Y)
- Content-based recommendations
- Trending products detection
- Seasonal recommendations
- Cross-sell and up-sell suggestions
- Bundle recommendations

**Usage Example:**
```typescript
import { enhancedRecommendationService } from '@/services/ai';

const recommendations = await enhancedRecommendationService.getPersonalizedRecommendations(
  'user-123',
  allProducts,
  10 // limit
);

recommendations.forEach(rec => {
  console.log(`${rec.product.name}: Score ${rec.score}, Reasons: ${rec.reasons.join(', ')}`);
});
```

### 5. Chatbot Assistant Service (`chatbotAssistantService.ts`)
Intelligent conversational assistant for user support.

**Key Features:**
- Natural language understanding
- Intent detection
- Context-aware responses
- Multi-turn conversations
- Action suggestions
- Step-by-step tutorials
- Contextual help for each page

**Usage Example:**
```typescript
import { chatbotAssistantService } from '@/services/ai';

const session = await chatbotAssistantService.startSession('user-123', {
  userRole: 'merchant',
  currentPage: '/merchant/inventory',
  language: 'fr'
});

const response = await chatbotAssistantService.sendMessage(
  session.id,
  'Comment ajouter un produit?'
);

console.log(response.message);
console.log('Suggested actions:', response.suggestedActions);
```

### 6. Image Recognition Service (`imageRecognitionService.ts`)
Product recognition and quality assessment from images.

**Key Features:**
- Product identification from photos
- Quality assessment (freshness, appearance, defects)
- Barcode scanning from images
- Batch product scanning
- Product categorization
- Multi-product detection in single image

**Usage Example:**
```typescript
import { imageRecognitionService } from '@/services/ai';

const analysis = await imageRecognitionService.recognizeProductFromImage(imageFile);

console.log('Recognized products:', analysis.recognizedProducts);
console.log('Quality grade:', analysis.qualityAssessment?.grade);
console.log('Estimated quantity:', analysis.estimatedQuantity);
```

### 7. Smart Notification Service (`smartNotificationService.ts`)
Intelligent notification prioritization and delivery optimization.

**Key Features:**
- Priority-based notification ranking
- Optimal delivery time calculation
- Notification grouping by category
- User activity pattern analysis
- Quiet hours respect
- Actionable notifications with suggested actions

**Usage Example:**
```typescript
import { smartNotificationService } from '@/services/ai';

const notification = await smartNotificationService.createNotification(
  'user-123',
  'Stock faible',
  'Vos tomates sont presque épuisées',
  'warning',
  'inventory',
  { stockLevel: 'low', productId: 'product-123' }
);

const prioritized = await smartNotificationService.prioritizeNotifications('user-123');
```

### 8. Multilingual Service (`multilingualService.ts`)
Translation and localization for French, Baoulé, and Dioula.

**Key Features:**
- Text translation between languages
- Automatic language detection
- Voice transcription
- Text-to-speech generation
- Localized content delivery
- Common phrases and expressions

**Usage Example:**
```typescript
import { multilingualService } from '@/services/ai';

const translation = await multilingualService.translate(
  'Bonjour, comment puis-je vous aider?',
  'fr',
  'baoulé'
);

console.log('Translation:', translation.translatedText);

const detected = await multilingualService.detectLanguage('Akwaba n\'gban');
console.log('Detected language:', detected.language);
```

### 9. Onboarding Service (`onboardingService.ts`)
Adaptive onboarding and contextual help system.

**Key Features:**
- Role-specific onboarding flows
- Adaptive difficulty based on tech literacy
- Step-by-step guidance
- Progress tracking
- Struggle detection
- Next action suggestions
- Simplified mode for beginners

**Usage Example:**
```typescript
import { onboardingService } from '@/services/ai';

const flow = await onboardingService.startOnboarding('user-123', 'merchant');

console.log('Steps:', flow.steps);
console.log('Estimated time:', flow.estimatedTimeRemaining, 'minutes');

const result = await onboardingService.completeStep(flow.id, flow.steps[0].id, 120);
console.log('Progress:', result.completionPercentage, '%');
```

## Integration Guide

### 1. Import Services
```typescript
import {
  inventoryPredictionService,
  priceOptimizationService,
  enhancedRecommendationService,
  chatbotAssistantService,
  imageRecognitionService,
  smartNotificationService,
  multilingualService,
  onboardingService
} from '@/services/ai';
```

### 2. Use in Components
All services are singleton instances and can be used directly:

```typescript
// In a React component
const MyComponent = () => {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const loadPredictions = async () => {
      const result = await inventoryPredictionService.predictStockNeeds(
        // ... parameters
      );
      setPredictions(result);
    };

    loadPredictions();
  }, []);

  return <div>{/* Render predictions */}</div>;
};
```

### 3. Error Handling
All services include built-in error handling and fallback mechanisms:

```typescript
try {
  const result = await someService.someMethod();
  // Handle success
} catch (error) {
  console.error('AI service error:', error);
  // Handle error with fallback behavior
}
```

## Performance Considerations

1. **Caching**: Most services implement internal caching to improve performance
2. **Async Operations**: All methods are asynchronous to prevent UI blocking
3. **Progressive Enhancement**: Services degrade gracefully when data is limited
4. **Lazy Loading**: Services are initialized only when first used

## Future Enhancements

- Real-time learning from user interactions
- Integration with external market data APIs
- Advanced NLP for better intent detection
- Computer vision improvements for product recognition
- Predictive analytics for business insights
- A/B testing framework for recommendation optimization

## Support

For questions or issues related to AI services, please refer to the main project documentation or contact the development team.
