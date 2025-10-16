# 🤖 Policy Viewer - Interactive Documentation Guide

## Overview

The Policy Viewer is a fully responsive, interactive web interface for the Autonomous Agent Policy & Escalation Ladder. It provides an accessible, user-friendly way to browse, search, and understand the agent governance framework.

## ✨ Features

### 🌐 Cross-Platform Compatibility

**Desktop Support:**

- ✅ macOS (Chrome, Safari, Firefox, Edge)
- ✅ Windows (Chrome, Firefox, Edge)
- ✅ Linux (Chrome, Firefox)

**Mobile Support:**

- ✅ iOS (Safari, Chrome)
- ✅ Android (Chrome, Firefox, Samsung Internet)
- ✅ Tablet devices (iPad, Android tablets)

**Browser Requirements:**

- Modern browsers with ES6 support
- JavaScript enabled
- Minimum viewport width: 320px

### 📱 Responsive Design

**Mobile-First Approach:**

- Touch-friendly interactions (44px minimum tap targets)
- Hamburger menu for navigation on small screens
- Horizontal scrolling for tab navigation
- Optimized font sizes for readability
- Reduced whitespace for mobile efficiency

**Desktop Enhancements:**

- Sticky table of contents sidebar
- Wide-screen layout optimization
- Keyboard navigation support
- Multi-column content display

**Breakpoints:**

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### 🔍 Search & Navigation

**Search Functionality:**

- Real-time filtering of policy sections
- Searches both titles and content
- Case-insensitive matching
- Highlights relevant sections

**Navigation Features:**

- Sticky header with quick access
- Collapsible/expandable sections
- Smooth scroll to section
- Mobile-friendly hamburger menu
- Table of contents with icons
- Expand/collapse all buttons

### 🎨 Design Features

**Visual Enhancements:**

- Color-coded sections by mode (Green, Teal, Blue, Purple, Orange, Red)
- Icon-based navigation for quick recognition
- Card-based layout for content separation
- Consistent spacing and typography
- Accessible color contrast ratios (WCAG 2.1 AA compliant)

**Dark Mode:**

- System-aware dark mode detection
- Manual toggle for user preference
- Properly contrasted colors in both modes
- Persistent state across sessions (future enhancement)

**Animations:**

- Smooth section expand/collapse
- Fade-in effects for content
- Scroll animations
- Button hover states

### ♿ Accessibility

**WCAG 2.1 AA Compliance:**

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- High contrast mode support

**Keyboard Shortcuts:**

- Tab: Navigate through interactive elements
- Enter/Space: Expand/collapse sections
- Arrow keys: Scroll content

### 🖨️ Print Support

**Print-Optimized Styles:**

- Automatic page breaks at section boundaries
- Expanded all sections for complete printing
- Optimized margins and spacing
- Black and white friendly
- Preserves code formatting

**Print Preparation:**

1. Click browser print (Ctrl+P / Cmd+P)
2. All sections auto-expand
3. Navigation hidden for clean output
4. Formatted for A4/Letter paper

## 🚀 Usage

### Accessing the Policy Viewer

1. **From the Application:**
   - Navigate to the main application page
   - Click on the "🤖 Agent Policy" tab
   - The policy viewer will load with all sections

2. **Direct Link:**
   - Access via: `http://your-app-url/?tab=policy`
   - Bookmarkable for quick reference

### Navigation Tips

**Desktop Users:**

- Use the left sidebar for quick section jumps
- Search bar in the header for instant filtering
- Expand/Collapse All buttons for bulk actions
- Click section headers to toggle content

**Mobile Users:**

- Tap hamburger menu (☰) for navigation
- Swipe horizontally through tabs
- Tap section headers to expand/collapse
- Use search bar at top for filtering
- Pinch to zoom on code blocks

### Search Best Practices

**Effective Searches:**

- Use keywords: "mode 0", "override", "approval", "test"
- Search for file types: "package.json", "tsconfig"
- Look for actions: "commit", "merge", "review"
- Find specifics: "diff budget", "acceptance criteria"

**Search Examples:**

- `"mode 3"` - Find all Mode 3 related content
- `"approval"` - See all approval requirements
- `"test"` - Find testing requirements
- `"file"` - View file access rules

## 🔧 Technical Implementation

### Component Structure

```
PolicyViewer.tsx
├── Header (Sticky)
│   ├── Title & Description
│   ├── Search Bar
│   ├── Dark Mode Toggle
│   └── Expand/Collapse Controls
├── Mobile Menu (Hamburger)
│   └── Navigation Links
├── Desktop Sidebar (Sticky)
│   └── Table of Contents
└── Main Content Area
    └── Collapsible Sections
        ├── Mode 0 - Normal
        ├── Mode 0.5 - Refactor
        ├── Mode 1 - LTRM
        ├── Mode 2 - CI Repair
        ├── Mode 3 - Override
        ├── Mode 4 - Freeze
        ├── Override Template
        ├── Work Order
        ├── Acceptance Criteria
        ├── Stale Work Policy
        └── Continuous Improvement
```

### State Management

```typescript
// Section expansion tracking
const [expandedSections, setExpandedSections] = useState<Set<string>>();

// Search functionality
const [searchQuery, setSearchQuery] = useState('');

// Theme management
const [isDarkMode, setIsDarkMode] = useState(false);

// Mobile menu state
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
```

### Performance Optimizations

**Rendering:**

- Dynamic imports for lazy loading
- Memoized section filtering
- Virtual scrolling for long content (future)
- Debounced search (future enhancement)

**Mobile:**

- Touch event optimization
- Reduced animations on mobile
- Lazy image loading (if images added)
- Service worker caching (future)

## 🎯 Design Decisions

### Color Coding System

Each mode has a distinct color for quick visual recognition:

| Mode     | Color  | Purpose                   |
| -------- | ------ | ------------------------- |
| Mode 0   | Green  | Safe, proceed immediately |
| Mode 0.5 | Teal   | Light refactor, safe      |
| Mode 1   | Blue   | Tooling fix, controlled   |
| Mode 2   | Purple | CI repair, specialized    |
| Mode 3   | Orange | Warning, approval needed  |
| Mode 4   | Red    | Stop, emergency freeze    |

### Typography Hierarchy

- **H1 (2xl-3xl):** Main page title
- **H2 (xl-2xl):** Section titles
- **H3 (lg-xl):** Mode titles
- **H4 (base-lg):** Subsection headers
- **Body (sm-base):** Content text
- **Code (xs-sm):** Code blocks and commands

### Spacing System

- **Mobile:** Compact spacing (4px-12px)
- **Tablet:** Medium spacing (8px-16px)
- **Desktop:** Generous spacing (12px-24px)

## 🐛 Troubleshooting

### Common Issues

**Issue: Dark mode not working**

- Solution: Check browser compatibility (CSS custom properties required)
- Fallback: Light mode is default

**Issue: Hamburger menu not showing**

- Solution: Ensure viewport width < 1024px
- Check: Browser dev tools responsive mode

**Issue: Search not filtering**

- Solution: Ensure JavaScript is enabled
- Clear cache and reload

**Issue: Sections not collapsing on mobile**

- Solution: Check touch events are not blocked
- Try desktop mode as alternative

### Browser-Specific Notes

**Safari (iOS):**

- Smooth scrolling may be less smooth
- Use -webkit- prefixes for animations
- Touch events optimized

**Chrome (macOS):**

- Best performance and compatibility
- Full feature support
- Hardware acceleration enabled

**Firefox:**

- May require manual dark mode toggle
- Full feature support
- Good performance

## 📊 Future Enhancements

### Planned Features

1. **Persistent State:**
   - Remember expanded sections
   - Save dark mode preference
   - Bookmark specific sections

2. **Export Options:**
   - PDF generation
   - Markdown export
   - JSON export for automation

3. **Enhanced Search:**
   - Fuzzy search
   - Search suggestions
   - Recent searches

4. **Collaboration:**
   - Comments on sections
   - Share specific sections
   - Version history

5. **Localization:**
   - Multi-language support
   - RTL language support
   - Date/time localization

6. **Analytics:**
   - Track most-viewed sections
   - Search analytics
   - User behavior insights

## 🤝 Contributing

To improve the Policy Viewer:

1. **Report Issues:**
   - UI bugs
   - Browser compatibility issues
   - Mobile responsiveness problems

2. **Suggest Features:**
   - Navigation improvements
   - Search enhancements
   - Visual design updates

3. **Submit PRs:**
   - Follow coding standards
   - Add tests for new features
   - Update documentation

## 📝 Changelog

### Version 1.0.0 (2025-10-16)

- ✨ Initial release
- ✅ Full responsive design
- ✅ Dark mode support
- ✅ Search functionality
- ✅ Collapsible sections
- ✅ Mobile navigation
- ✅ Print support
- ✅ Accessibility compliance

---

**Questions?** Contact the engineering team or file an issue in the repository.
