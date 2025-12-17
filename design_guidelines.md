# Balloon Loop Mobile App - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - The app has explicit login/signup functionality and user-generated content (balloon arch listings).

**Implementation:**
- Use SSO for authentication
- Include Apple Sign-In (required for iOS)
- Include Google Sign-In for Android/cross-platform
- Login/signup screens with:
  - Privacy policy & terms of service links
  - "Continue with Apple" and "Continue with Google" buttons
- Account screen features:
  - User profile with avatar and display name
  - My listings management
  - App preferences (notifications, units)
  - Log out (with confirmation alert)
  - Delete account (Settings > Account > Delete with double confirmation)

### Navigation Structure
**Tab Navigation** with 4 tabs + Floating Action Button

The app has 4 distinct feature areas with a core "Create Listing" action:

1. **Explore Tab** (Home) - Map/List view of balloon arches
2. **Search Tab** - Advanced filters and search
3. **Favorites Tab** - Saved balloon arch listings
4. **Profile Tab** - User account and settings
5. **Floating Action Button** - Create new listing (primary action)

## Screen Specifications

### 1. Explore Screen (Home Tab)
**Purpose:** Discover balloon arches nearby with map or list view

**Layout:**
- Header: Custom transparent header
  - Left: Logo (Balloon Loop wordmark)
  - Right: Toggle button (Map ⇄ List icon)
  - No search bar (dedicated Search tab instead)
- Main content: Switchable between Map View and List View
  - **Map View:** Full-screen interactive map with location pins
  - **List View:** Scrollable vertical list of listing cards
- Safe area insets: 
  - Top: `headerHeight + Spacing.xl`
  - Bottom: `tabBarHeight + Spacing.xl`

**Components:**
- Interactive map (react-native-maps) with custom balloon arch pin markers
- Listing cards with: image, title, distance, rating
- Current location button (floating on map, bottom-right)
- "No arches nearby" empty state with CTA to create first listing

### 2. Search & Filter Screen (Search Tab)
**Purpose:** Find specific balloon arches using filters

**Layout:**
- Header: Default navigation header with search bar
  - Title: "Search"
  - Search bar embedded in header
- Main content: Scrollable form with filter sections
- Safe area insets:
  - Top: `Spacing.xl` (has non-transparent header)
  - Bottom: `tabBarHeight + Spacing.xl`

**Components:**
- Search input (debounced)
- Filter sections:
  - Distance range slider (0-50 miles)
  - Color palette chips (multi-select)
  - Event type checkboxes (Birthday, Wedding, Corporate, etc.)
  - Date range picker
  - Price range (Free, Paid)
- "Apply Filters" button at bottom
- Active filter chips at top (dismissible)

### 3. Favorites Screen (Favorites Tab)
**Purpose:** View saved balloon arch listings

**Layout:**
- Header: Default navigation header
  - Title: "Favorites"
- Main content: Scrollable vertical list
- Safe area insets:
  - Top: `Spacing.xl`
  - Bottom: `tabBarHeight + Spacing.xl`

**Components:**
- Grid of saved listing cards (2 columns)
- Empty state: "No favorites yet" with heart icon
- Pull-to-refresh functionality

### 4. Profile Screen (Profile Tab)
**Purpose:** Manage account and app settings

**Layout:**
- Header: Custom header
  - Title: "Profile"
  - Right button: Settings gear icon
- Main content: Scrollable sections
- Safe area insets:
  - Top: `Spacing.xl`
  - Bottom: `tabBarHeight + Spacing.xl`

**Components:**
- Profile header: Avatar, name, member since
- "My Listings" section with count and preview cards
- "Statistics" section (views, favorites received)
- Settings navigation items

### 5. Create Listing Screen (Modal)
**Purpose:** Post a new balloon arch listing

**Layout:**
- Presented as full-screen modal
- Header: Custom header
  - Left: "Cancel" button
  - Title: "New Listing"
  - Right: "Post" button (primary color, disabled until valid)
- Main content: Scrollable form
- Safe area insets:
  - Top: `Spacing.xl`
  - Bottom: `insets.bottom + Spacing.xl`

**Components:**
- Photo upload section (multiple images, first is cover)
- Title text input
- Description textarea
- Location picker (map + address search)
- Event type selector
- Color tags (multi-select chips)
- Date/time picker (optional - when it was created)
- Visibility toggle (Public/Private)

### 6. Listing Detail Screen (Stack Navigation)
**Purpose:** View full details of a balloon arch

**Layout:**
- Header: Transparent custom header
  - Left: Back button
  - Right: Share button, Favorite button
- Main content: Scrollable view with parallax image header
- Safe area insets:
  - Top: `headerHeight + Spacing.xl`
  - Bottom: `insets.bottom + Spacing.xl`

**Components:**
- Image carousel (swipeable, pagination dots)
- Title and creator info
- Description text
- Location map (small, tappable to expand)
- Color tags
- Event type badge
- "Get Directions" button
- Contact creator button (if applicable)
- Report listing (in overflow menu)

## Design System

### Color Palette
**Primary Colors:**
- Primary: `#FF6B9D` (vibrant pink - balloon theme)
- Primary Dark: `#E5527E`
- Primary Light: `#FFB8D1`

**Neutral Colors:**
- Background: `#FFFFFF`
- Surface: `#F8F9FA`
- Border: `#E9ECEF`
- Text Primary: `#212529`
- Text Secondary: `#6C757D`
- Text Disabled: `#ADB5BD`

**Accent Colors:**
- Success: `#10B981` (for favorites)
- Warning: `#F59E0B`
- Error: `#EF4444`

### Typography
**Font Family:** System default (San Francisco on iOS, Roboto on Android)

**Type Scale:**
- Hero: 32px, Bold (listing titles on detail page)
- H1: 28px, Bold (screen titles)
- H2: 22px, Semibold (section headers)
- H3: 18px, Semibold (card titles)
- Body: 16px, Regular (main content)
- Caption: 14px, Regular (metadata, timestamps)
- Small: 12px, Regular (labels, helper text)

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

### Border Radius
- Small: 8px (buttons, chips)
- Medium: 12px (cards, inputs)
- Large: 16px (modals, bottom sheets)
- Circle: 999px (avatars, FAB)

### Component Specifications

**Listing Cards:**
- Aspect ratio: 4:3 for cover image
- Border radius: Medium (12px)
- Subtle shadow on white background:
  - shadowOffset: {width: 0, height: 1}
  - shadowOpacity: 0.05
  - shadowRadius: 4
- Card content padding: lg (16px)
- Pressed state: Scale down to 0.98, opacity 0.9

**Floating Action Button (Create):**
- Size: 56px × 56px circle
- Position: Bottom-right, 16px from edges
- Icon: Plus symbol in white
- Background: Primary gradient
- Drop shadow (EXACT specifications):
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2
- Pressed state: Scale to 0.95

**Map Pins:**
- Custom balloon-shaped marker icon (pink to match brand)
- Size: 32px × 40px
- Selected state: Slightly larger with bounce animation

**Search Bar:**
- Height: 40px
- Border radius: Circle (999px)
- Background: Surface color
- Icon: Search (Feather icon)
- Placeholder: "Search balloon arches..."

**Filter Chips:**
- Height: 32px
- Border radius: Small (8px)
- Unselected: Border color with transparent background
- Selected: Primary color background with white text
- Pressed feedback: Subtle scale (0.98)

### Visual Design Principles
- Use Feather icons from @expo/vector-icons for all UI icons
- Avoid emojis; use icons instead
- All touchable elements have visual feedback (scale + opacity)
- Avoid heavy drop shadows except for floating elements
- Maintain generous white space for clean, breathable layouts
- Use subtle borders and backgrounds to separate content sections

### Critical Assets
1. **Balloon Loop Logo** (landscape and icon variations)
2. **Custom Balloon Pin Icon** for map markers (pink balloon shape)
3. **Empty State Illustrations:**
   - No listings nearby (balloon with location pin)
   - No favorites (heart with balloon)
   - No search results (magnifying glass with balloon)
4. **Onboarding Illustrations** (3 screens showing key features)

### Accessibility
- Minimum touch target: 44×44 points (per Apple HIG)
- Color contrast ratio: 4.5:1 for text, 3:1 for UI components
- Support dynamic type scaling
- Provide text alternatives for icons
- Ensure map controls are keyboard accessible
- VoiceOver/TalkBack labels for all interactive elements