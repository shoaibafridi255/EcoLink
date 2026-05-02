
# EcoLink - Complete Implementation Plan

Based on your project proposal, here's what needs to be built:

## 1. Fix Browse Page & Real Material Feed
The Browse page currently shows hardcoded mock data instead of real materials from the database. This will be replaced with live data.

- Replace mock listings in FeaturedListings with real database queries
- Show materials with images, category, price, location
- Homepage featured section also shows real materials

## 2. Search & Filter System
As specified in section 3.2 and 6.3 of your proposal:

- **Keyword search** from the search bar in navbar
- **Category filter** (Metals, Wood, Textiles, Plastics, Paper, Glass, etc.)
- **Location filter**
- **Price type filter** (Free, Negotiable, Fixed)
- Filters displayed as a sidebar or top bar on the Browse page

## 3. Material Detail Page
When a user clicks on a listing:

- Full description, all images (gallery), quantity, pricing
- Lister's company name and location
- "Express Interest" button that opens a chat thread

## 4. In-App Messaging System
As specified in section 3.3 and 6.4 of your proposal:

- Database tables: `conversations` and `messages`
- When Seeker clicks "Express Interest", a conversation is created linked to that material
- Chat interface for real-time messaging between Lister and Seeker
- Messages page accessible from navbar showing all conversations

## 5. Admin Dashboard
As specified in section 4D of your proposal:

- Admin role support (using existing `user_roles` table with `app_role` enum)
- Admin dashboard page at `/admin` with:
  - Overview stats: total users, total listings, active listings, messages count
  - User management: view all users, ban/unban accounts
  - Category management: view material categories
  - All listings overview with ability to moderate

## 6. User Dashboard Enhancements
As specified in section 6.5:

- Metrics on Profile page: active listings count, materials saved from landfill
- Pending message notifications indicator in navbar

---

## Technical Details

**New database tables:**
- `conversations` (id, material_id, seeker_id, lister_id, created_at)
- `messages` (id, conversation_id, sender_id, content, created_at)
- Realtime enabled on messages table

**New pages:**
- `/materials/:id` - Material detail page
- `/messages` - Conversations list and chat
- `/admin` - Admin dashboard (protected by role check)

**Modified components:**
- `FeaturedListings.tsx` - fetch real data from DB
- `Browse.tsx` - add filters and search
- `Navbar.tsx` - messages indicator, admin link
- `Profile.tsx` - dashboard metrics

**Database migrations:**
- Create conversations and messages tables with RLS
- Add admin role to a designated user
