# Story Generation Prompt - Before vs After

## Side-by-Side Comparison

### BEFORE (Original - 13 lines)

```
Search for recent news about this keyword.

Return ONLY this exact JSON format (no extra text or fields):
{
  "stories": [
    {
      "title": "Headline",
      "category": "Technology",
      "rating": 7,
      "summary": "Brief summary",
      "source": "Source name",
      "url": "https://...",
      "date": "2025-10-16"
    }
  ]
}

If no news found, return: {"stories": []}

Keyword:
```

**Issues:**

- ❌ No guidance on story variety
- ❌ No rating scale explanation
- ❌ No source diversity requirements
- ❌ Generic category examples
- ❌ No story type variety
- ❌ Minimal summary guidance

---

### AFTER (Enhanced - 38 lines)

```
Search for recent news about this keyword. Find a WIDE VARIETY of stories with diverse perspectives, sources, and angles.

DIVERSITY REQUIREMENTS:
- Include stories from MULTIPLE sources (mainstream, niche, independent, international)
- Mix different story types: breaking news, analysis, opinion pieces, investigative reports, feature stories
- Vary significance ratings (1-10) based on true impact - not all stories should be 7-8
- Use diverse categories that accurately reflect content
- Include different perspectives and viewpoints on the topic
- Find both popular stories AND lesser-known but significant coverage

STORY SELECTION CRITERIA:
- Prioritize RECENCY: Only stories from the last 24 hours
- Seek VARIETY: Don't just return mainstream sources
- Value SIGNIFICANCE: Rate based on actual impact and importance
- Ensure ACCURACY: Verify dates, sources, and URLs are real

RATING GUIDELINES (1-10):
- 9-10: Major breaking news with global impact
- 7-8: Significant developments, industry-shaping news
- 5-6: Notable stories, moderate importance
- 3-4: Minor updates, niche interest
- 1-2: Small mentions, very limited impact

Return ONLY this exact JSON format (no extra text or fields):
{
  "stories": [
    {
      "title": "Exact headline from source",
      "category": "Technology|Business|Politics|Science|Health|Entertainment|Sports|World|Opinion|Analysis|etc.",
      "rating": 7,
      "summary": "2-3 sentence summary focusing on key facts and significance",
      "source": "Exact source publication name",
      "url": "https://full-article-url",
      "date": "2025-10-16"
    }
  ]
}

If no news found, return: {"stories": []}

Keyword:
```

**Improvements:**

- ✅ Explicit diversity requirements (6 specific guidelines)
- ✅ Clear story selection criteria (4 priorities)
- ✅ Detailed rating scale (1-10 with examples)
- ✅ Multiple category examples
- ✅ Story type variety specified
- ✅ Enhanced summary guidance
- ✅ Source variety requirements
- ✅ Perspective diversity emphasis

---

## Key Additions

### 1. Diversity Requirements Section (NEW)

```
DIVERSITY REQUIREMENTS:
- Include stories from MULTIPLE sources (mainstream, niche, independent, international)
- Mix different story types: breaking news, analysis, opinion pieces, investigative reports, feature stories
- Vary significance ratings (1-10) based on true impact - not all stories should be 7-8
- Use diverse categories that accurately reflect content
- Include different perspectives and viewpoints on the topic
- Find both popular stories AND lesser-known but significant coverage
```

### 2. Story Selection Criteria (NEW)

```
STORY SELECTION CRITERIA:
- Prioritize RECENCY: Only stories from the last 24 hours
- Seek VARIETY: Don't just return mainstream sources
- Value SIGNIFICANCE: Rate based on actual impact and importance
- Ensure ACCURACY: Verify dates, sources, and URLs are real
```

### 3. Rating Guidelines (NEW)

```
RATING GUIDELINES (1-10):
- 9-10: Major breaking news with global impact
- 7-8: Significant developments, industry-shaping news
- 5-6: Notable stories, moderate importance
- 3-4: Minor updates, niche interest
- 1-2: Small mentions, very limited impact
```

---

## Visual Impact

### Before: Generic Results

```
┌─────────────────────────────────────────┐
│ Story 1: Tech Company News - Rating 7  │
│ Source: TechCrunch                      │
│ Category: Technology                    │
├─────────────────────────────────────────┤
│ Story 2: Another Tech News - Rating 8  │
│ Source: TechCrunch                      │
│ Category: Technology                    │
├─────────────────────────────────────────┤
│ Story 3: More Tech News - Rating 7     │
│ Source: The Verge                       │
│ Category: Technology                    │
└─────────────────────────────────────────┘

Issues: Repetitive, same sources, narrow ratings
```

### After: Diverse Results

```
┌─────────────────────────────────────────────────────┐
│ 🔴 Story 1: Breaking Tech Breakthrough - Rating 9   │
│ Source: Reuters (International)                      │
│ Category: Technology - Breaking News                 │
├─────────────────────────────────────────────────────┤
│ 💡 Story 2: Opinion on Tech Ethics - Rating 6       │
│ Source: The Guardian (Opinion)                       │
│ Category: Technology - Opinion                       │
├─────────────────────────────────────────────────────┤
│ 📊 Story 3: Analysis of Market Trends - Rating 7    │
│ Source: Financial Times (Analysis)                   │
│ Category: Business - Analysis                        │
├─────────────────────────────────────────────────────┤
│ 🌍 Story 4: Tech in Developing Nations - Rating 5   │
│ Source: Al Jazeera (International)                   │
│ Category: World - Feature                            │
├─────────────────────────────────────────────────────┤
│ 🔬 Story 5: Research Paper Published - Rating 4     │
│ Source: Nature (Academic)                            │
│ Category: Science - Research                         │
└─────────────────────────────────────────────────────┘

Benefits: Diverse sources, varied ratings, multiple perspectives
```

---

## Real Example Scenarios

### Scenario 1: Keyword = "artificial intelligence"

**BEFORE (Typical Results):**

1. "OpenAI Announces New Model" - TechCrunch - Rating 7 - Technology
2. "AI Startup Gets Funding" - TechCrunch - Rating 8 - Technology
3. "Google's AI Update" - The Verge - Rating 7 - Technology

**Limitations:**

- All mainstream tech sources
- All ratings 7-8
- All same category
- All breaking news type
- No diverse perspectives

---

**AFTER (Expected Results):**

1. "OpenAI's GPT-5 Raises Concerns About AI Safety" - The New York Times - Rating 9 - Technology - Breaking News
2. "Opinion: Why AI Regulation is Overdue" - The Guardian - Rating 6 - Opinion - Analysis
3. "Small AI Startup Disrupts Medical Imaging" - VentureBeat - Rating 5 - Health - Feature
4. "Research: AI Bias in Facial Recognition Persists" - Nature - Rating 7 - Science - Research
5. "How Rural Schools Use AI for Personalized Learning" - EdWeek - Rating 4 - Education - Feature
6. "China's AI Development Outpaces US in Key Areas" - South China Morning Post - Rating 8 - World - Analysis
7. "Developers Share Concerns About AI Code Tools" - Stack Overflow Blog - Rating 3 - Technology - Community

**Benefits:**

- 7 different sources (mainstream, niche, international, academic)
- Ratings range 3-9 (true distribution)
- 6 different categories
- 4 different story types
- Multiple perspectives (safety, ethics, education, international, developer)

---

## Impact on User Experience

### Before

Users would see:

- Repetitive mainstream coverage
- Similar ratings on all stories
- Limited perspectives
- Generic categories
- Missing niche/interesting stories

### After

Users will see:

- Rich, diverse coverage from multiple angles
- True importance ratings (easier to prioritize)
- Discover niche sources and perspectives
- Specific, meaningful categories
- Both popular AND lesser-known significant stories

---

## Technical Details

| Metric                    | Before   | After               | Change      |
| ------------------------- | -------- | ------------------- | ----------- |
| **Lines of Code**         | 13       | 38                  | +192%       |
| **Character Count**       | ~320     | ~1,400              | +338%       |
| **Estimated Tokens**      | ~80      | ~350                | +270 tokens |
| **Cost Impact**           | Baseline | +$0.0001 per search | Negligible  |
| **Guidance Sections**     | 0        | 3                   | NEW         |
| **Explicit Requirements** | 0        | 10+                 | NEW         |
| **Category Examples**     | 1        | 10+                 | +900%       |

---

## Why This Matters

### Problem

AI models, without specific guidance, tend to:

- Return the first 5-10 results from mainstream sources
- Rate everything 6-8 (avoiding extremes)
- Use generic categories
- Provide similar perspectives

### Solution

Explicit instructions transform the AI from:

- **Search aggregator** → **News curator**
- **Generic results** → **Diverse perspectives**
- **Repetitive sources** → **Wide variety**
- **Clustered ratings** → **True distribution**

---

## Customization

Users can customize this prompt by:

1. Settings → Search Instructions
2. Edit the prompt text
3. Add their own requirements
4. Save changes

Examples of custom additions:

- "Prioritize academic sources"
- "Include stories from [specific region]"
- "Focus on long-form analysis"
- "Avoid opinion pieces"

---

## Conclusion

This enhancement is **non-breaking**, **backward-compatible**, and provides **immediate value** to all users without requiring any additional configuration.

The expanded prompt helps AI models act as **intelligent news curators** rather than simple search engines, delivering the diverse, well-rounded news coverage that users expect from a professional news report generator.

---

**Change Summary**: Added 25 lines of detailed guidance to transform basic search into intelligent, diverse news curation
