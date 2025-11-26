# Create Post - Caption/Article Toggle Feature

**Date:** November 21, 2025  
**Purpose:** Separate caption and article modes with dedicated toggle and rich text editor for articles  
**Status:** Implementation Ready

---

## 📋 Feature Overview

Replace the current dynamic caption/article label with a dedicated toggle system that clearly separates two distinct input modes:

1. **Caption Mode** - Short text overlays for images (≤100 chars)
2. **Article Mode** - Long-form content with basic HTML formatting (>100 chars)

---

## 🎨 Design Specifications

### **1. Toggle Component**

**Visual Design:**
```
┌─────────────────────────────────────┐
│  [Caption ════] [    Article    ]  │  ← 50% width each
│    Active       Inactive            │
│  Purple border  No border           │
└─────────────────────────────────────┘
```

**Specifications:**
- Segmented control (like iOS tab switcher)
- Full width container
- Two mutually exclusive options: Caption | Article
- Active tab: Purple 2px bottom border (#a855f7)
- Smooth transition animation: 200ms ease
- Font: Medium weight (500) for active, Normal (400) for inactive
- Background: Transparent (no fill)
- **Smart Disable:** Caption tab becomes disabled (grayed out) when text length > 100

---

### **2. Caption Mode (≤100 characters)**

**Behavior:**
- Default mode on page load
- Small textarea: 3 rows (existing pattern)
- Placeholder: "Share your thoughts..."
- **Enter key** = Submit post (no Shift required)
- No formatting toolbar (plain text only)
- Character counter appears at 4000/5000 chars (80% threshold)
- Max length: 5000 chars

**Auto-Switch:**
- When text exceeds 100 characters → automatically switch to Article mode
- Smooth transition with textarea height change (3 rows → 8 rows)

---

### **3. Article Mode (>100 characters)**

**Behavior:**
- Large textarea: 8 rows (existing pattern)
- Placeholder: "Write your article..."
- **Enter key** = New line (no submit)
- **Tab key** = Insert 4 spaces (indentation)
- **Mobile:** Auto-detect 3 consecutive spaces → replace with 4-space indent
- Rich text formatting toolbar (see below)
- Character counter appears at 4000/5000 chars (80% threshold)
- Max length: 5000 chars

**Toolbar Placement:**
- **Desktop:** Fixed at top of textarea (always visible)
- **Mobile:** Collapsible button that expands toolbar above keyboard

---

### **4. Rich Text Toolbar**

**Formatting Options:**
| Button | Function | HTML Output | Description |
|--------|----------|-------------|-------------|
| **B** | Bold | `<b>text</b>` | Wraps selection in bold tags |
| **U** | Underline | `<u>text</u>` | Wraps selection in underline tags |
| **•** | Bullet List | `<ul><li>text</li></ul>` | Converts lines to list items |
| **≡** | Text Align | `<p style="text-align: center">` | Toggles left → center → right |

**Behavior:**
- Icon-only buttons (no labels) for space efficiency
- No visual state tracking (apply and move on)
- HTML tags for backward compatibility with Web V1
- Apply formatting to selected text in textarea

**Bullet List Logic:**
```
Input:
Item 1
Item 2
Item 3

Output:
<ul>
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
</ul>
```

**Text Alignment:**
- Toggle through: left → center → right → left (cycle)
- Applies to current paragraph/selection
- Uses inline style: `style="text-align: center"`

---

### **5. Indentation System**

**Desktop:**
- **Tab key** = Insert 4 spaces (not `\t` character)
- Standard HTML indentation pattern

**Mobile:**
- Auto-detect **3 consecutive spaces** typed by user
- Replace with **4-space indentation** automatically
- Helps mobile users who can't access Tab key

---

### **6. Submit Button (Article Mode)**

**Location:** Top-right header
**Visual:** Icon only (Send/Upload icon from Lucide)
**Replaces:** Text "Post" button
**State:** Disabled when no image or no location

---

### **7. Mobile Toolbar Behavior**

**Collapsed State (Default):**
```
┌─────────────────────────────────────┐
│  [🎨 Format]                        │  ← Small button (left/right)
└─────────────────────────────────────┘
```

**Expanded State (After Tap):**
```
┌─────────────────────────────────────┐
│  [B] [U] [•] [≡]                   │  ← Slides in from button direction
└─────────────────────────────────────┘
```

**Animation:**
- If button is on **left**: Slide toolbar from left
- If button is on **right**: Slide toolbar from right
- Duration: 200ms ease
- Expands above keyboard (fixed position)

---

## 🔧 Technical Implementation

### **Component Structure**

```
CreatePostForm
├── CaptionArticleToggle (NEW)
│   ├── Caption Tab
│   └── Article Tab (disabled if text > 100)
├── ImageUploader (EXISTING)
└── TextInputArea (MODIFIED)
    ├── Caption Mode: Simple Textarea (3 rows)
    └── Article Mode: Textarea + RichTextToolbar
        ├── Desktop: Fixed Toolbar
        └── Mobile: Collapsible Toolbar (NEW)
```

### **New Components to Create**

1. **`CaptionArticleToggle.tsx`**
   - 50% width segmented control
   - Active state management
   - Disable Caption tab when text > 100

2. **`RichTextToolbar.tsx`**
   - Bold, Underline, Bullet List, Text Align buttons
   - HTML tag insertion logic
   - Selection detection and manipulation

3. **`CollapsibleToolbar.tsx`** (Mobile-only wrapper)
   - Format button trigger
   - Slide animation
   - Responsive visibility (hidden on desktop)

### **Modified Components**

1. **`CreatePostForm.tsx`**
   - Add toggle state management
   - Add mode switching logic (caption ↔ article)
   - Add toolbar integration
   - Add submit icon in header (article mode)

2. **`Textarea.tsx`** (if needed)
   - Tab key handler (insert 4 spaces)
   - Mobile 3-space auto-indent detection

---

## 🎯 Auto-Switch Logic

**Threshold:** 100 characters

**Behavior:**
```typescript
// Auto-switch from Caption → Article
if (text.length > 100 && mode === 'caption') {
  setMode('article');
}

// Disable Caption tab if text too long
const canSwitchToCaption = text.length <= 100;
```

**Edge Cases:**
- If user manually types 101st character in Caption mode → auto-switch to Article
- If user deletes text in Article mode to ≤100 chars → Caption tab becomes enabled again
- If user in Article mode with >100 chars → Caption tab grayed out with tooltip

---

## 📱 Responsive Behavior

| Feature | Desktop (≥768px) | Mobile (<768px) |
|---------|------------------|-----------------|
| **Toggle** | Full width, 50% tabs | Full width, 50% tabs |
| **Toolbar** | Fixed at top of textarea | Collapsible button |
| **Submit** | Bottom-right button | Top-right icon |
| **Indentation** | Tab key | 3-space auto-detect |
| **Toolbar Animation** | None (always visible) | Slide in from button |

---

## ✅ Implementation Checklist

### **Phase 1: Toggle Component**
- [ ] Create `CaptionArticleToggle.tsx` component
- [ ] Implement 50% width segmented control
- [ ] Add purple bottom border for active tab
- [ ] Add transition animation (200ms)
- [ ] Implement disable logic for Caption tab

### **Phase 2: Rich Text Toolbar**
- [ ] Create `RichTextToolbar.tsx` component
- [ ] Implement Bold button (`<b>` wrapper)
- [ ] Implement Underline button (`<u>` wrapper)
- [ ] Implement Bullet List button (`<ul><li>` conversion)
- [ ] Implement Text Align button (toggle left/center/right)
- [ ] Add text selection detection
- [ ] Add HTML tag insertion logic

### **Phase 3: Mobile Toolbar**
- [ ] Create `CollapsibleToolbar.tsx` wrapper
- [ ] Add Format button with icon
- [ ] Implement slide animation (direction-based)
- [ ] Add responsive visibility (hidden on desktop)
- [ ] Position above keyboard (fixed bottom)

### **Phase 4: Indentation System**
- [ ] Add Tab key handler (insert 4 spaces)
- [ ] Add mobile 3-space detection
- [ ] Auto-replace 3 spaces with 4 spaces

### **Phase 5: Integration**
- [ ] Update `CreatePostForm.tsx` with toggle
- [ ] Add mode state management
- [ ] Connect toolbar to textarea
- [ ] Add submit icon in header (article mode)
- [ ] Test auto-switch logic (100 char threshold)
- [ ] Test disable Caption tab logic

### **Phase 6: Polish**
- [ ] Add keyboard shortcuts (Ctrl+B, Ctrl+U)
- [ ] Add tooltips on toolbar buttons
- [ ] Test on real mobile devices
- [ ] Test with iOS keyboard animations
- [ ] Verify backward compatibility with Web V1 HTML

---

## 🚀 Success Criteria

**Functional:**
- ✅ Toggle between Caption and Article modes
- ✅ Auto-switch at 100 characters
- ✅ Disable Caption tab when text > 100
- ✅ Apply bold, underline, bullets, alignment
- ✅ Tab indentation on desktop
- ✅ 3-space auto-indent on mobile

**UX:**
- ✅ Smooth transitions (200ms)
- ✅ Clear visual separation of modes
- ✅ Toolbar collapsible on mobile
- ✅ No keyboard animation glitches (iOS)
- ✅ Touch targets ≥44px

**Technical:**
- ✅ HTML output compatible with Web V1
- ✅ No performance issues with large text
- ✅ Works on all modern browsers
- ✅ Accessible (keyboard navigation, ARIA labels)

---

## 📝 Notes

1. **No Italic:** Intentionally excluded to keep toolbar minimal
2. **No Font Selection:** Too complex for MVP
3. **HTML vs Markdown:** Using HTML for backward compatibility
4. **Character Counter:** Same 80% threshold (4000/5000) for both modes
5. **Submit Behavior:** Enter submits in Caption, creates newline in Article
6. **Mobile Keyboard:** Toolbar expands above keyboard, not sticky (avoids iOS glitches)

---

**Ready for Implementation** ✅
